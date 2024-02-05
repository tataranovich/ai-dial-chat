import { appContainer } from '@/src/ui/selectors';
import { Banner } from '@/src/ui/webElements/banner';
import { BaseElement } from '@/src/ui/webElements/baseElement';
import { Chat } from '@/src/ui/webElements/chat';
import { ChatBar } from '@/src/ui/webElements/chatBar';
import { ConversationSettings } from '@/src/ui/webElements/conversationSettings';
import { Header } from '@/src/ui/webElements/header';
import { PromptBar } from '@/src/ui/webElements/promptBar';
import { Page } from '@playwright/test';

export class AppContainer extends BaseElement {
  constructor(page: Page) {
    super(page, appContainer);
  }

  private header!: Header;
  private banner!: Banner;
  private chat!: Chat;
  private chatBar!: ChatBar;
  private promptBar!: PromptBar;
  private conversationSettings!: ConversationSettings;

  getHeader(): Header {
    if (!this.header) {
      this.header = new Header(this.page);
    }
    return this.header;
  }

  getBanner(): Banner {
    if (!this.banner) {
      this.banner = new Banner(this.page);
    }
    return this.banner;
  }

  getChat(): Chat {
    if (!this.chat) {
      this.chat = new Chat(this.page);
    }
    return this.chat;
  }

  getChatBar(): ChatBar {
    if (!this.chatBar) {
      this.chatBar = new ChatBar(this.page);
    }
    return this.chatBar;
  }

  getPromptBar(): PromptBar {
    if (!this.promptBar) {
      this.promptBar = new PromptBar(this.page);
    }
    return this.promptBar;
  }

  getConversationSettings(): ConversationSettings {
    if (!this.conversationSettings) {
      this.conversationSettings = new ConversationSettings(this.page);
    }
    return this.conversationSettings;
  }
}