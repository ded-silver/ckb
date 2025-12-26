export const handleContactsAfterCommand = async (command: string): Promise<void> => {
  try {
    const contactsModule = await import("@shared/lib/contacts");
    const { getFileSystem } = await import("@entities/file/model");

    const fs = getFileSystem();
    const lainMessageExists = fs["/home/user/secrets/message_from_lain.dat"] !== undefined;

    if (contactsModule.shouldSendLainMessage() && !lainMessageExists) {
      const fileCreated = contactsModule.createLainMessageFile();

      if (fileCreated) {
        contactsModule.markLainMessageSent();

        try {
          const { triggerLainFirstContact } = await import("@features/email/lib");
          triggerLainFirstContact();
        } catch (error) {
          console.warn("Failed to trigger Lain email:", error);
        }
      } else {
        console.warn("Lain message file creation failed, will retry on next command");
      }
    } else if (command !== "sessions" && command !== "disconnect") {
      if (contactsModule.isContactsRead()) {
        contactsModule.incrementCommandsAfterContacts();
      }
    }
  } catch (error) {
    console.warn("Failed to process contacts:", error);
  }
};
