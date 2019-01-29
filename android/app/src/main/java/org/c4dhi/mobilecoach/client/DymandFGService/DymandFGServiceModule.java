package org.c4dhi.mobilecoach.client.DymandFGService;

import android.app.ActivityManager;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.os.SystemClock;
import android.preference.PreferenceManager;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.c4dhi.mobilecoach.client.Config;
import org.c4dhi.mobilecoach.client.MainActivity;
import org.c4dhi.mobilecoach.client.R;

import static org.c4dhi.mobilecoach.client.Config.DymandFGServiceRunning;
import static org.c4dhi.mobilecoach.client.Config.onBoardingDone;
import static org.c4dhi.mobilecoach.client.Config.pendingIntentFlag;

public class DymandFGServiceModule extends ReactContextBaseJavaModule {

    public Intent mService = null;
    private static final String LOG_TAG = "Logs: DymandFGServModul";
    public static final String INTENT_STRING_MODULE_2_SERVICE = "DYMAND_MODULE_2_SERVICE";
    public static final String INTENT_STRING_SERVICE_2_MODULE = "DYMAND_SERVICE_2_MODULE";
    public static final String CHANNEL_ID = "DynamdNotificationReminderChannel";
    int NOTIFICATION_ID = 123456709;


    public DymandFGServiceModule(ReactApplicationContext reactContext){
        super(reactContext);
        BroadcastReceiver userIntentReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.i(LOG_TAG, "The broadcast message from service is received");
                Bundle extras = intent.getExtras();
                if(extras == null) {
                    Log.w(LOG_TAG, "Extras is null");
                }
                else {
                    String value = (String) extras.get("message");
                    String [] tokens = value.split(" ");

                    switch (tokens[0]) {
                        case "recordingDone":
                            sendIntentToServerRecordingDone();
                            break;

                        case "SelfReportDoneACK":
                            sendIntentToServerSelfReportDoneACK();
                            break;

                        case "restartService":
                            restartService();
                            break;

                        default:
                            Log.w(LOG_TAG, "Unknown message");
                            break;
                    }

                }
            }
        };
        LocalBroadcastManager.getInstance(getReactApplicationContext()).registerReceiver(userIntentReceiver, new IntentFilter(INTENT_STRING_SERVICE_2_MODULE));
    }

    public void restartService() {
        if(DymandFGServiceRunning) return;
        Log.i(LOG_TAG, "Foreground services count: " + getFGServiceCount());
        Log.i(LOG_TAG, "Checking whether the required service exists..." );

        if(isMyServiceRunning(DymandFGService.class)) {
            Toast.makeText(getReactApplicationContext(), "Service exists. Kill it before starting a new one...", Toast.LENGTH_SHORT).show();
            return;
        }

        DymandFGService.acquireStaticLock(getReactApplicationContext());
        DymandFGServiceRunning = true;
        mService = new Intent(this.getReactApplicationContext(), DymandFGService.class);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(mService);
                Log.i(LOG_TAG, "StartForegroundService");
            } else {
                getReactApplicationContext().startService(mService);
                Log.i(LOG_TAG, "StartService");
            }
        }
        catch (Exception e){
            return;
        }
    }

    // Methods that are used to send intent to server - START

    private void sendIntentToServerSelfReportDoneACK() {
        Log.i(LOG_TAG, "User intent (Self Report Done) is being sent... ");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("USER_INTENT_SELF_REPORT_DONE_ACK_LISTENER_TAG", null);
    }

    private void sendIntentToServerRecordingDone() {
        Config.hasStartedSelfReport = false;
        WritableMap params = Arguments.createMap();
        String timeStamp = System.currentTimeMillis() + "";
        Log.i(LOG_TAG, "User intent (RD) time stamp is " + timeStamp +".");
        params.putString("RD_TimeStamp", timeStamp);
        Log.i(LOG_TAG, "User intent (RD) is being sent... ");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("USER_INTENT_RECORDING_DONE_LISTENER_TAG", params);
    }

    // Methods that are used to send intent to server - END

    @Override
    public String getName() {
        return "DymandFGServiceModule";
    }

    @ReactMethod
    public void startService(Callback errorCallback, Callback startedCAllback) {
        //Toast.makeText(getReactApplicationContext(), "Trying to start initial service...", Toast.LENGTH_SHORT).show();
        //if(DymandFGServiceRunning) return;
        Log.i(LOG_TAG, "Foreground services count: " + getFGServiceCount());
        Log.i(LOG_TAG, "Checking whether the required service exists..." );

        if(isMyServiceRunning(DymandFGService.class)) {
            //Toast.makeText(getReactApplicationContext(), "Service exists. Kill it before starting a new one...", Toast.LENGTH_SHORT).show();
            return;
        }

        DymandFGService.acquireStaticLock(getReactApplicationContext());
        DymandFGServiceRunning = true;
        mService = new Intent(this.getReactApplicationContext(), DymandFGService.class);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(mService);
                Log.i(LOG_TAG, "StartForegroundService");
            } else {
                getReactApplicationContext().startService(mService);
                Log.i(LOG_TAG, "StartService");
            }
        }
        catch (Exception e){
            errorCallback.invoke(e.getMessage());
            return;
        }

        // set onBoardingDone variable to be true
        onBoardingDone = true;

        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(getReactApplicationContext());
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putBoolean("isOnboardingDone", onBoardingDone);
        editor.apply();

        startedCAllback.invoke();

    }


    @ReactMethod
    public void startServiceWithAlarm(Callback errorCallback, Callback startedCallback) {
        //Toast.makeText(getReactApplicationContext(), "Trying to start initial service...", Toast.LENGTH_SHORT).show();
        //if(DymandFGServiceRunning) return;
        Log.i(LOG_TAG, "Foreground services count: " + getFGServiceCount());
        Log.i(LOG_TAG, "Checking whether the required service exists..." );

        if(isMyServiceRunning(DymandFGReceiverService.DymandFGServiceInternal.class)) {
            Log.d(LOG_TAG, "Service exists already");
            return;
        }

        Log.i(LOG_TAG, "Setting an alarm to start the service..." );

        AlarmManager alarmMgr = (AlarmManager) getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);
        Intent startServiceIntent = new Intent(getReactApplicationContext(), DymandFGReceiverService.class);
        PendingIntent alarmIntent = PendingIntent.getBroadcast(getReactApplicationContext(), 711, startServiceIntent, pendingIntentFlag);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            alarmMgr.setExact(AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime(), alarmIntent);
        }
        else {
            alarmMgr.set(AlarmManager.ELAPSED_REALTIME_WAKEUP, SystemClock.elapsedRealtime(), alarmIntent);
        }

        onBoardingDone = true;

        SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(getReactApplicationContext());
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putBoolean("isOnboardingDone", onBoardingDone);
        editor.apply();

        startedCallback.invoke();

    }

    // Used in the react method startService
    private int getFGServiceCount() {
        int count = 0;
        ActivityManager manager = (ActivityManager) getReactApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (service.foreground){
                Log.i(LOG_TAG, service.service.getClassName());
                count++;
            }
        }
        return count;
    }


    @ReactMethod
    public void stopDymandFGService() {
        if(!DymandFGServiceRunning) return;
        getReactApplicationContext().stopService(mService);
        mService = null;
        DymandFGServiceRunning = false;
        Toast.makeText(getReactApplicationContext(), "Android: initial service stopped", Toast.LENGTH_SHORT).show();
    }


    private boolean isMyServiceRunning(Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) getReactApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }


    @ReactMethod
    public void showNotificationES(String contentText) {
        Log.i(LOG_TAG, "Starting to put notification about the reminder...");
        createNotificationChannelSelfReport();
        Intent notificationIntent = new Intent(getReactApplicationContext(), MainActivity.class);
        PendingIntent pendingIntent =
                PendingIntent.getActivity(getReactApplicationContext(), 0, notificationIntent, pendingIntentFlag);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(getReactApplicationContext(), CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Dymand App")
                .setContentText(contentText)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                // Set the intent that will fire when the user taps the notification
                .setContentIntent(pendingIntent)
                .setLocalOnly(true)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(getReactApplicationContext());
        notificationManager.notify(NOTIFICATION_ID, mBuilder.build());
    }

    // Used in raect method notifyUserAboutSelfReport()
    // code from dev.android tutorial
    private void createNotificationChannelSelfReport() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Experience Sampling Reminder";
            String description = "Experience Sampling Reminder";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getReactApplicationContext().getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }


    @ReactMethod
    public void timedWakeLockAndCloseWebView(String arguments) {
        Log.i(LOG_TAG, "timedWakeLockAndCloseWebView: The argument is: " + arguments);
        String [] tokens = arguments.split("-");
        if(tokens.length < 2) {
            Log.e(LOG_TAG, "Arguments to call TimedWakeLockCloseWebView is not valid, arguments: "+ arguments);
            return;
        }

        Config.webViewCloseTimerCount++;

        long startTime = Long.parseLong(tokens[0]);
        long curTime = System.currentTimeMillis();
        long expiryTime = Integer.parseInt(tokens[1]) * 60 * 1000 + startTime;
        Log.i(LOG_TAG, "The current time stamp: " + curTime);
        Log.i(LOG_TAG, "The expiry time stamp: " + expiryTime);

        if(curTime > expiryTime) {
            Log.i(LOG_TAG, "The survey is already expired");
            return;
        }

        Log.i(LOG_TAG, "Acquiring wake lock for closing web view later");
        PowerManager powerManager = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
        final PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "Dymand::TimedWakeLockCloseWebView");
        wakeLock.acquire();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {

                Config.webViewCloseTimerCount--;
                Log.i(LOG_TAG, "Releasing wake lock and checking to close closing webview");

                if(Config.webViewCloseTimerCount != 0) {
                    Log.i(LOG_TAG, "Not closing webView, total timedWakeLockAndCloseWebView remaining:" + Config.webViewCloseTimerCount);
                }
                else {
                    Log.i(LOG_TAG, "Closing webView");
                    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("CLOSING_WEBVIEW_TIMER_EXPIRED", null);
                }
                wakeLock.release();
            }
        }, (expiryTime-curTime) + 5000); // 5 second buffer to let the timer inside limesurvey to act first.
    }


    @ReactMethod
    public void timedWakeLockAndRemindUserSelfReportNotification(String timeInMinutes) {
        int timeInMinutesInInt = Integer.parseInt(timeInMinutes);
        Log.i(LOG_TAG, "Acquiring wake lock - reminder self report");
        PowerManager powerManager = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
        final PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "Dymand::TimedWakeLockRemindSR");
        wakeLock.acquire();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.i(LOG_TAG, "Releasing wake lock and try to notify user about self report");
                //getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                //        .emit("USER_INTENT_SELF_REPORT_REMIND_USER_LISTENER_TAG", null);
                if(!Config.hasStartedSelfReport) showNotificationES("Reminder to fill the self report");
                else {
                    Log.i(LOG_TAG, "The user need not be notified as the self report is already started.");
                }
                wakeLock.release();
            }
        }, timeInMinutesInInt * 60 * 1000);
    }


    // React methods that intend to send messages to watch - START

    @ReactMethod
    public void sendConfig(String config){
        Log.i(LOG_TAG, "Broadcasting Config");
        try {
            Intent intent = new Intent(INTENT_STRING_MODULE_2_SERVICE);
            intent.putExtra("message", config);
            LocalBroadcastManager.getInstance(getReactApplicationContext()).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void sendHasStartedSelfReportSignal(){
        Config.hasStartedSelfReport = true;
        Log.i(LOG_TAG, "Broadcasting hasStartedSelfReportSignal");
        try {
            Intent intent = new Intent(INTENT_STRING_MODULE_2_SERVICE);
            intent.putExtra("message", "hasStartedSelfReportSignal");
            LocalBroadcastManager.getInstance(getReactApplicationContext()).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void sendSelfReportCompletedSignal(){
        Log.i(LOG_TAG, "Broadcasting selfReportCompletedSignal");
        try {
            Intent intent = new Intent(INTENT_STRING_MODULE_2_SERVICE);
            intent.putExtra("message", "selfReportCompletedSignal");
            LocalBroadcastManager.getInstance(getReactApplicationContext()).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // React methods that intend to send messages to watch - END

}
