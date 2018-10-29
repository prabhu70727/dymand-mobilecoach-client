package org.c4dhi.mobilecoach.client.DymandFGService;

import android.app.ActivityManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.c4dhi.mobilecoach.client.Config;
import org.c4dhi.mobilecoach.client.InterventionFGService;
import org.c4dhi.mobilecoach.client.MainActivity;
import org.c4dhi.mobilecoach.client.R;

public class DymandFGServiceModule extends ReactContextBaseJavaModule {

    public Intent mService = null;
    private static final String LOG_TAG = "Logs: FGServiceModule";
    public static final String INTENT_STRING_MODULE_2_SERVICE = "DYMAND_MODULE_2_SERVICE";
    public static final String INTENT_STRING_SERVICE_2_MODULE = "DYMAND_SERVICE_2_MODULE";
    public boolean DymandFGServiceRunning = false;
    public static final String CHANNEL_ID = "DynamdNotificationReminderChannel";
    int NOTIFICATION_ID = 123456709;

    public DymandFGServiceModule(ReactApplicationContext reactContext){
        super(reactContext);
        BroadcastReceiver userIntentReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.i(LOG_TAG, "The broadcast message is received");
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

                        case "configSent":
                            sendIntentToServerConfigSent();
                            break;

                        case "SelfReportDoneACK":
                            sendIntentToServerSelfReportDoneACK();
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

    private void sendIntentToServerSelfReportDoneACK() {
        Log.i(LOG_TAG, "User intent (Self Report Done) is being sent... ");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("USER_INTENT_SELF_REPORT_DONE_ACK_LISTENER_TAG", null);
    }

    private void sendIntentToServerConfigSent() {
        Log.i(LOG_TAG, "User intent (config sent) is being sent... ");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("USER_INTENT_CONFIG_SENT_LISTENER_TAG", null);
    }

    private void sendIntentToServerRecordingDone() {
        Config.hasStartedSelfReport = false;
        Log.i(LOG_TAG, "User intent (RD) is being sent... ");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("USER_INTENT_RECORDING_DONE_LISTENER_TAG", null);
    }

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

    @Override
    public String getName() {
        return "DymandFGServiceModule";
    }

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


    @ReactMethod
    public void startService(Callback errorCallback, Callback startedCAllback) {
        //Toast.makeText(getReactApplicationContext(), "Trying to start initial service...", Toast.LENGTH_SHORT).show();
        if(DymandFGServiceRunning) return;
        Log.i(LOG_TAG, "Foreground services count: " + getFGServiceCount());
        Log.i(LOG_TAG, "Checking whether the required service exists..." );

        if(isMyServiceRunning(DymandFGService.class) || isMyServiceRunning(InterventionFGService.class)) {
            Toast.makeText(getReactApplicationContext(), "Service exists. Kill it before starting a new one...", Toast.LENGTH_SHORT).show();
            return;
        }

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
        startedCAllback.invoke();

    }

    // todo remove after use
    public void sendIntentToServer()
    {
        Log.i(LOG_TAG, "User intent is being sent... ");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("USER_INTENT_LISTENER_TAG", null);
    }

    @ReactMethod
    public void stopDymandFGService() {
        if(!DymandFGServiceRunning) return;
        getReactApplicationContext().stopService(mService);
        mService = null;
        DymandFGServiceRunning = false;
        Toast.makeText(getReactApplicationContext(), "Android: initial service stopped", Toast.LENGTH_SHORT).show();
    }

    @ReactMethod
    public void timedWakeLockAndCloseWebView(String timeInMinutes) {
        int timeInMinutesInInt = Integer.parseInt(timeInMinutes);
        Log.i(LOG_TAG, "Acquiring wake lock - closing web view");
        PowerManager powerManager = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
        final PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "Dymand::TimedWakeLockCloseWebView");
        wakeLock.acquire();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.i(LOG_TAG, "Releasing wake lock and closing webview");
                getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("CLOSING_WEBVIEW_TIMER_EXPIRED", null);
                wakeLock.release();
            }
        }, timeInMinutesInInt * 60 * 1000);
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
                if(!Config.hasStartedSelfReport) notifyUserAboutSelfReport();
                else {
                    Log.i(LOG_TAG, "The user need not be notified as the self report is already started.");
                }
                wakeLock.release();
            }
        }, timeInMinutesInInt * 60 * 1000);
    }

    @ReactMethod
    public void notifyUserAboutSelfReport() {
        Log.i(LOG_TAG, "Starting to put notification about the reminder...");
        createNotificationChannelSelfReport();
        Intent notificationIntent = new Intent(getReactApplicationContext(), MainActivity.class);
        PendingIntent pendingIntent =
                PendingIntent.getActivity(getReactApplicationContext(), 0, notificationIntent, 0);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(getReactApplicationContext(), CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Dymand App")
                .setContentText("Reminder to fill the self report")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                // Set the intent that will fire when the user taps the notification
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(getReactApplicationContext());
        notificationManager.notify(NOTIFICATION_ID, mBuilder.build());
    }

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

    private boolean isMyServiceRunning(Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) getReactApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

}
