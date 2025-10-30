// frontend/utils/apis.js
export const apis = () => {
  const base = process.env.REACT_APP_API_URL || "http://localhost:5000"; // fallback for local
  const prefix = `${base}/api`;

  const list = {
    registerUser: `${prefix}/register`,
    captcha: `${prefix}/captcha`,
    loginUser: `${prefix}/login`,
    forgetPassword: `${prefix}/forget/password`,
    otpVerify: `${prefix}/otp/verify`,
    getOtpTime: `${prefix}/otp/time`,
    updatePassword: `${prefix}/password/update`,
    getAccess: `${prefix}/get/access`,
    loginviaFirebase: `${prefix}/loginviafirebase`,
    savePasswordMagicLink: `${prefix}/save_password_magic_link`,
    user: `${prefix}/user`,
    logout: `${prefix}/logout`,
    logoutAllDevices: `${prefix}/logout-all`,

    accessChat: `${prefix}/chat/access`,
    fetchChats: `${prefix}/chat`,
    sendMessage: `${prefix}/chat/message`,
    getMessages: (chatId) => `${prefix}/chat/message/${chatId}`,

    getAllUsers: `${prefix}/get-user`,

    getProfile: `${prefix}/profile`,
    updateProfile: `${prefix}/profile/update`,

    addContact: `${prefix}/contacts/add`,
    getContacts: `${prefix}/contacts`,
    resetUnread: (contactId) => `${prefix}/contacts/${contactId}/reset`,
    editContact: (id) => `${prefix}/contacts/${id}`,
    deleteContact: (id) => `${prefix}/contacts/${id}`,

    deleteMessageForMe: (messageId) =>
      `${prefix}/chat/message/${messageId}/delete-for-me`,
    clearAllMessages: (chatId) =>
      `${prefix}/chat/message/${chatId}/clear-for-me`,
  };

  return list;
};
