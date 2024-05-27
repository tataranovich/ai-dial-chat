import { DialAIEntityModel } from '@/chat/types/models';
import dialTest from '@/src/core/dialFixtures';
import {
  API,
  Attachment,
  ExpectedConstants,
  ExpectedMessages,
  UploadMenuOptions,
} from '@/src/testData';
import { Colors, Overflow, Styles } from '@/src/ui/domData';
import { GeneratorUtil, ModelsUtil } from '@/src/utils';
import { expect } from '@playwright/test';

let modelsWithAttachments: DialAIEntityModel[];
dialTest.beforeAll(async () => {
  modelsWithAttachments = ModelsUtil.getLatestModelsWithAttachment();
});

dialTest(
  'Clip icon in message box exists if chat is based on model which does work with attachments.\n' +
    'Chat is named automatically to the 1st attached document name if to send an attachment without a text.\n' +
    'Send button is available if to send an attachment without a text',
  async ({
    dialHomePage,
    talkToSelector,
    setTestIds,
    attachFilesModal,
    sendMessage,
    conversations,
    chatHeader,
    fileApiHelper,
    attachmentDropdownMenu,
  }) => {
    setTestIds('EPMRTC-1891', 'EPMRTC-1639', 'EPMRTC-1536');
    const randomModelWithAttachment = GeneratorUtil.randomArrayElement(
      modelsWithAttachments,
    );
    const attachedFiles = [
      Attachment.sunImageName,
      Attachment.cloudImageName,
    ].sort();

    await dialTest.step('Upload files to app', async () => {
      for (const file of attachedFiles) {
        await fileApiHelper.putFile(file);
      }
    });

    await dialTest.step(
      'Create new conversation based on model with input attachments and verify clip icon is available in message textarea',
      async () => {
        await dialHomePage.openHomePage();
        await dialHomePage.waitForPageLoaded({
          isNewConversationVisible: true,
        });
        await talkToSelector.selectModel(randomModelWithAttachment);
        await expect
          .soft(
            await sendMessage.attachmentMenuTrigger.getElementLocator(),
            ExpectedMessages.clipIconIsAvailable,
          )
          .toBeVisible();
      },
    );

    await dialTest.step(
      'Upload 2 files and verify Send button is enabled',
      async () => {
        await sendMessage.attachmentMenuTrigger.click();
        await attachmentDropdownMenu.selectMenuOption(
          UploadMenuOptions.attachUploadedFiles,
        );
        for (const file of attachedFiles) {
          await attachFilesModal.checkAttachedFile(file);
        }
        await attachFilesModal.attachFiles();
        const isSendMessageBtnEnabled =
          await sendMessage.sendMessageButton.isElementEnabled();
        expect
          .soft(
            isSendMessageBtnEnabled,
            ExpectedMessages.sendMessageButtonEnabled,
          )
          .toBeTruthy();
      },
    );

    await dialTest.step(
      'Send request and verify conversation is named by the 1st attachment in the textarea',
      async () => {
        await sendMessage.send();
        await expect
          .soft(
            await conversations.getConversationByName(attachedFiles[0]),
            ExpectedMessages.conversationIsVisible,
          )
          .toBeVisible();
        expect
          .soft(
            await chatHeader.chatTitle.getElementInnerContent(),
            ExpectedMessages.headerTitleIsValid,
          )
          .toBe(attachedFiles[0]);
      },
    );
  },
);

dialTest(
  'Chat is named automatically to user text if to send it with attachment',
  async ({
    dialHomePage,
    talkToSelector,
    setTestIds,
    attachFilesModal,
    sendMessage,
    conversations,
    chatHeader,
    fileApiHelper,
    attachmentDropdownMenu,
    chat,
  }) => {
    setTestIds('EPMRTC-1640');
    const randomModelWithAttachment = GeneratorUtil.randomArrayElement(
      modelsWithAttachments,
    );
    const request = 'Describe the picture';

    await dialTest.step('Upload file to app', async () => {
      await fileApiHelper.putFile(Attachment.sunImageName);
    });

    await dialTest.step(
      'Create new conversation based on model with input attachments and set request text',
      async () => {
        await dialHomePage.openHomePage();
        await dialHomePage.waitForPageLoaded({
          isNewConversationVisible: true,
        });
        await talkToSelector.selectModel(randomModelWithAttachment);
        await sendMessage.attachmentMenuTrigger.click();
        await attachmentDropdownMenu.selectMenuOption(
          UploadMenuOptions.attachUploadedFiles,
        );
        await attachFilesModal.checkAttachedFile(Attachment.sunImageName);
        await attachFilesModal.attachFiles();
      },
    );

    await dialTest.step(
      'Set request in textarea and verify conversation is named with request text ',
      async () => {
        await chat.sendRequestWithKeyboard(request, false);
        await expect
          .soft(
            await conversations.getConversationByName(request),
            ExpectedMessages.conversationIsVisible,
          )
          .toBeVisible();
        expect
          .soft(
            await chatHeader.chatTitle.getElementInnerContent(),
            ExpectedMessages.headerTitleIsValid,
          )
          .toBe(request);
      },
    );
  },
);

dialTest(
  'Send button is unavailable while attachment is being uploaded.\n' +
    'Blue loading bar is shown while the file is being uploaded to the message box',
  async ({
    dialHomePage,
    talkToSelector,
    setTestIds,
    sendMessage,
    tooltip,
    uploadFromDeviceModal,
    attachmentDropdownMenu,
    sendMessageInputAttachments,
  }) => {
    setTestIds('EPMRTC-1767', 'EPMRTC-1904');
    const randomModelWithAttachment = GeneratorUtil.randomArrayElement(
      modelsWithAttachments,
    );

    await dialTest.step(
      'Create new conversation based on model with input attachments and upload attachment from device',
      async () => {
        await dialHomePage.openHomePage();
        await dialHomePage.waitForPageLoaded({
          isNewConversationVisible: true,
        });
        await talkToSelector.selectModel(randomModelWithAttachment);
        await sendMessage.attachmentMenuTrigger.click();
        await dialHomePage.uploadData(
          { path: Attachment.sunImageName, dataType: 'upload' },
          () =>
            attachmentDropdownMenu.selectMenuOption(
              UploadMenuOptions.uploadFromDevice,
            ),
        );
        await dialHomePage.throttleAPIResponse('**/*');
        await uploadFromDeviceModal.uploadButton.click();
      },
    );

    await dialTest.step(
      'Verify loading indicator is shown under the file, send button is disabled and have tooltip on hover',
      async () => {
        const isSendMessageBtnEnabled =
          await sendMessage.sendMessageButton.isElementEnabled();
        expect
          .soft(
            isSendMessageBtnEnabled,
            ExpectedMessages.sendMessageButtonDisabled,
          )
          .toBeFalsy();

        await sendMessage.sendMessageButton.hoverOver();
        const tooltipContent = await tooltip.getContent();
        expect
          .soft(tooltipContent, ExpectedMessages.tooltipContentIsValid)
          .toBe(ExpectedConstants.sendMessageAttachmentLoadingTooltip);

        await expect
          .soft(
            await sendMessageInputAttachments.inputAttachmentLoadingIndicator(
              Attachment.sunImageName,
            ),
            ExpectedMessages.attachmentLoadingIndicatorNotVisible,
          )
          .toBeVisible();
      },
    );
  },
);

dialTest(
  'Long attachment name is cut with three dots at the end in message box.\n' +
    'Attachment name is shown fully if to click on it. Text attachment.\n' +
    'Attached picture is shown if to click on the button.\n' +
    'Download attached file from user message',
  async ({
    dialHomePage,
    talkToSelector,
    setTestIds,
    attachFilesModal,
    sendMessage,
    fileApiHelper,
    attachmentDropdownMenu,
    chat,
    chatMessages,
    page,
    sendMessageInputAttachments,
  }) => {
    setTestIds('EPMRTC-1896', 'EPMRTC-1897', 'EPMRTC-1898', 'EPMRTC-1899');
    const randomModelWithAttachment = GeneratorUtil.randomArrayElement(
      modelsWithAttachments,
    );
    const request = 'Describe the picture';

    await dialTest.step('Upload file to app', async () => {
      await fileApiHelper.putFile(Attachment.longImageName);
    });

    await dialTest.step(
      'Create new conversation based on model with long name input attachment',
      async () => {
        await dialHomePage.openHomePage();
        await dialHomePage.waitForPageLoaded({
          isNewConversationVisible: true,
        });
        await talkToSelector.selectModel(randomModelWithAttachment);
        await sendMessage.attachmentMenuTrigger.click();
        await attachmentDropdownMenu.selectMenuOption(
          UploadMenuOptions.attachUploadedFiles,
        );
        await attachFilesModal.checkAttachedFile(Attachment.longImageName);
        await attachFilesModal.attachFiles();
      },
    );

    await dialTest.step(
      'Verify long attachment name is truncated in Send message box',
      async () => {
        const attachmentNameOverflow = await sendMessageInputAttachments
          .inputAttachmentName(Attachment.longImageName)
          .getComputedStyleProperty(Styles.text_overflow);
        expect
          .soft(
            attachmentNameOverflow[0],
            ExpectedMessages.attachmentNameIsTruncated,
          )
          .toBe(Overflow.ellipsis);
      },
    );

    await dialTest.step(
      'Send request and verify long attachment name is truncated in chat history',
      async () => {
        await page.route(API.chatHost, async (route) => {
          await route.fulfill({
            body: Buffer.from('{"content":"Response"}\u0000{}\u0000'),
          });
        });
        await chat.sendRequestWithButton(request);
        const attachmentNameOverflow = await chatMessages
          .getChatMessageAttachment(1, Attachment.longImageName)
          .getComputedStyleProperty(Styles.text_overflow);
        expect
          .soft(
            attachmentNameOverflow[0],
            ExpectedMessages.attachmentNameIsTruncated,
          )
          .toBe(Overflow.ellipsis);
      },
    );

    await dialTest.step(
      'Click on attachment name and verify full name is visible, attachment is expanded',
      async () => {
        await page.unrouteAll();
        await chatMessages.expandChatMessageAttachment(
          1,
          Attachment.longImageName,
        );
        const isAttachmentNameTruncated = await chatMessages
          .getChatMessageAttachment(1, Attachment.longImageName)
          .isElementWidthTruncated();
        expect
          .soft(
            isAttachmentNameTruncated,
            ExpectedMessages.attachmentNameIsFullyVisible,
          )
          .toBeFalsy();
        await expect
          .soft(
            await chatMessages.getOpenedChatMessageAttachment(1),
            ExpectedMessages.attachmentIsExpanded,
          )
          .toBeVisible();
      },
    );

    await dialTest.step(
      'Click on attachment name again and verify name is truncated, attachment is collapsed',
      async () => {
        await chatMessages.collapseChatMessageAttachment(
          1,
          Attachment.longImageName,
        );
        const isAttachmentNameTruncated = await chatMessages
          .getChatMessageAttachment(1, Attachment.longImageName)
          .isElementWidthTruncated();
        expect
          .soft(
            isAttachmentNameTruncated,
            ExpectedMessages.attachmentNameIsTruncated,
          )
          .toBeTruthy();

        await expect
          .soft(
            await chatMessages.getOpenedChatMessageAttachment(1),
            ExpectedMessages.attachmentIsCollapsed,
          )
          .toBeHidden();
      },
    );

    await dialTest.step(
      'Click on download attachment button and verify it is successfully downloaded',
      async () => {
        const downloadedData = await dialHomePage.downloadData(() =>
          chatMessages.getDownloadAttachmentIcon(1).click(),
        );
        expect
          .soft(
            downloadedData.path,
            ExpectedMessages.attachmentIsSuccessfullyDownloaded,
          )
          .toContain(Attachment.longImageName);
      },
    );
  },
);

dialTest(
  'Error icon and red file name appear because of Network error while file is being uploaded',
  async ({
    dialHomePage,
    talkToSelector,
    setTestIds,
    sendMessage,
    uploadFromDeviceModal,
    attachmentDropdownMenu,
    sendMessageInputAttachments,
    context,
  }) => {
    setTestIds('EPMRTC-1905');
    const randomModelWithAttachment = GeneratorUtil.randomArrayElement(
      modelsWithAttachments,
    );

    await dialTest.step(
      'Create new conversation based on model with input attachments and upload attachment from device in offline mode',
      async () => {
        await dialHomePage.openHomePage();
        await dialHomePage.waitForPageLoaded({
          isNewConversationVisible: true,
        });
        await talkToSelector.selectModel(randomModelWithAttachment);
        await sendMessage.attachmentMenuTrigger.click();
        await dialHomePage.uploadData(
          { path: Attachment.sunImageName, dataType: 'upload' },
          () =>
            attachmentDropdownMenu.selectMenuOption(
              UploadMenuOptions.uploadFromDevice,
            ),
        );
        await context.setOffline(true);
        await uploadFromDeviceModal.uploadButton.click();
      },
    );

    await dialTest.step(
      'Verify attachment name is red, error icon is displayed near attachment',
      async () => {
        for (let retryAttempt = 1; retryAttempt <= 2; retryAttempt++) {
          if (retryAttempt === 2) {
            await sendMessageInputAttachments
              .inputAttachmentLoadingRetry(Attachment.sunImageName)
              .click();
          }
          const attachmentNameColor = await sendMessageInputAttachments
            .inputAttachmentName(Attachment.sunImageName)
            .getComputedStyleProperty(Styles.color);
          expect
            .soft(
              attachmentNameColor[0],
              ExpectedMessages.attachmentNameColorIsValid,
            )
            .toBe(Colors.textError);
          await expect
            .soft(
              await sendMessageInputAttachments.inputAttachmentErrorIcon(
                Attachment.sunImageName,
              ),
              ExpectedMessages.attachmentHasErrorIcon,
            )
            .toBeVisible();
        }
      },
    );

    await dialTest.step(
      'Click on Retry icon in online mode and verify attachment is uploaded',
      async () => {
        await context.setOffline(false);
        await sendMessageInputAttachments
          .inputAttachmentLoadingRetry(Attachment.sunImageName)
          .click();
        const attachmentNameColor = await sendMessageInputAttachments
          .inputAttachmentName(Attachment.sunImageName)
          .getComputedStyleProperty(Styles.color);
        expect
          .soft(
            attachmentNameColor[0],
            ExpectedMessages.attachmentNameColorIsValid,
          )
          .toBe(Colors.textPrimary);
        await expect
          .soft(
            await sendMessageInputAttachments.inputAttachmentErrorIcon(
              Attachment.sunImageName,
            ),
            ExpectedMessages.attachmentHasErrorIcon,
          )
          .toBeHidden();
      },
    );
  },
);