// src/program/llama/llama.state.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from 'src/chat/chat.service';
import Together from "together-ai";
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class LlamaState {
    private readonly memberId = 'llama-3.1';
    private readonly together: Together;

    constructor(
        private readonly configService: ConfigService,
        private readonly chatService: ChatService,
        private readonly appGateway: AppGateway,
    ) {
        const apiKey = this.configService.get<string>('TOGETHER_API_KEY');
        this.together = new Together({ apiKey });
    }

    private determineMessageRole(message: any): 'system' | 'assistant' | 'user' {
        if (message.type === 'SYSTEM') return 'system';
        return message.senderId === this.memberId ? 'assistant' : 'user';
    }

    async getConversation(chatId: string) {
        const messages = await this.chatService.getConversationHistory(chatId);
        const memberMetadata = await this.chatService.getMemberMetadata(
            this.memberId,
        );
        const systemMessage = memberMetadata.systemMessage;
        const chatMember = memberMetadata.chats.find(
            (chat) => chat.chatId === chatId,
        );
        const chatInstructions = chatMember?.chatInstructions;

        const formattedMessages = messages.map((message) => ({
            role: this.determineMessageRole(message),
            content: (message.content as { text: string }).text ?? '',
        }));

        const combinedInstructions = [systemMessage, chatInstructions]
            .filter(Boolean)
            .join('\n');

        if (combinedInstructions) {
            formattedMessages.unshift({
                role: 'system',
                content: combinedInstructions,
            });
        }

        return formattedMessages;
    }

    async reply(chatId: string) {
        try {
            this.appGateway.sendTypingIndicator(chatId, this.memberId, true);

            const formattedMessages = await this.getConversation(chatId);

            if (
                formattedMessages.length > 0 &&
                formattedMessages[formattedMessages.length - 1].role === 'assistant'
            ) {
                return;
            }

            const response = await this.together.chat.completions.create({
                model: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
                messages: formattedMessages,
            });

            if (response.choices.length > 0) {
                const message = response.choices[0].message;

                if (message.content.trim() === '') {
                    return;
                } else {
                    return { text: message.content };
                }
            } else {
                throw new Error('No content received from Together AI.');
            }
        } catch (error) {
            console.error('Error calling Together AI:', error);
            throw new Error('Failed to get response from Together AI.');
        } finally {
            this.appGateway.sendTypingIndicator(chatId, this.memberId, false);
        }
    }
}
