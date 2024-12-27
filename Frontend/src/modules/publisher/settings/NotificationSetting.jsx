import { useState } from "react";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    allNotifications: true,
    emailNotification: true,
    loginAlerts: true,
    passwordChange: true,
    twoFactorAuth: true,
    paymentConfirmation: true,
    paymentFailure: true,
  });

  const toggleSetting = (setting) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [setting]: !prevSettings[setting],
    }));
  };

  // Calling API for Notification
  // if (settings.allNotifications === true) {
  //   console.log(settings);
  // } else {
  //   settings.allNotifications = false;
  //   console.log(settings);
  // }

  return (
    <div className="space-y-4 min-h-screen">
      <div className="flex justify-between items-center p-4 bg-white rounded-md shadow-lg">
        <span className="text-gray-700 font-medium">Get all notifications</span>
        <div
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
            settings.allNotifications ? "bg-blue-500" : "bg-gray-300"
          }`}
          onClick={() => toggleSetting("allNotifications")}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              settings.allNotifications ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      <div className="p-4 bg-white rounded-md shadow-lg">
        <div className="text-gray-700 font-semibold border-b pb-2 border-gray-200">
          Notification Channel Setting
        </div>
        <div className="flex justify-between items-center pt-4">
          <span className="text-gray-600">Email Notification</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              settings.emailNotification && settings.allNotifications
                ? "bg-blue-500"
                : "bg-gray-300"
            } ${
              settings.allNotifications ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() =>
              settings.allNotifications && toggleSetting("emailNotification")
            }
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.emailNotification ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-md shadow-lg">
        <div className="text-gray-700 font-semibold border-b pb-2 border-gray-20">
          Account Security Alerts
        </div>
        <div className="flex justify-between items-center border-b pb-2 border-gray-200 pt-4">
          <span className="text-gray-600">Login Alerts</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              settings.loginAlerts && settings.allNotifications
                ? "bg-blue-500"
                : "bg-gray-300"
            } ${
              settings.allNotifications ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() =>
              settings.allNotifications && toggleSetting("loginAlerts")
            }
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.loginAlerts ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-between items-center border-b pb-2 border-gray-200 pt-4">
          <span className="text-gray-600">Password Change Notification</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              settings.passwordChange && settings.allNotifications
                ? "bg-blue-500"
                : "bg-gray-300"
            } ${
              settings.allNotifications ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() =>
              settings.allNotifications && toggleSetting("passwordChange")
            }
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.passwordChange ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <span className="text-gray-600">Two-Factor Authentication</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              settings.twoFactorAuth && settings.allNotifications
                ? "bg-blue-500"
                : "bg-gray-300"
            } ${
              settings.allNotifications ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() =>
              settings.allNotifications && toggleSetting("twoFactorAuth")
            }
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.twoFactorAuth ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-md shadow-lg">
        <div className="text-gray-700 font-semibold border-b pb-2 border-gray-200">
          Billing & Payment Notification
        </div>
        <div className="flex justify-between items-center border-b pb-2 border-gray-200 pt-4">
          <span className="text-gray-600">Payment Confirmation</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              settings.paymentConfirmation && settings.allNotifications
                ? "bg-blue-500"
                : "bg-gray-300"
            } ${
              settings.allNotifications ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() =>
              settings.allNotifications && toggleSetting("paymentConfirmation")
            }
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.paymentConfirmation ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <span className="text-gray-600">Payment Failure</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
              settings.paymentFailure && settings.allNotifications
                ? "bg-blue-500"
                : "bg-gray-300"
            } ${
              settings.allNotifications ? "" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() =>
              settings.allNotifications && toggleSetting("paymentFailure")
            }
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.paymentFailure ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
