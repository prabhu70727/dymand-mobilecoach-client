package org.c4dhi.mobilecoach.client.DymandFGService;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.wearable.CapabilityClient;
import com.google.android.gms.wearable.CapabilityInfo;
import com.google.android.gms.wearable.DataClient;
import com.google.android.gms.wearable.DataEvent;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.DataItem;
import com.google.android.gms.wearable.DataMap;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.PutDataRequest;
import com.google.android.gms.wearable.Wearable;

import org.c4dhi.mobilecoach.client.Config;
import org.c4dhi.mobilecoach.client.LocalTimer;
import org.c4dhi.mobilecoach.client.MainActivity;
import org.c4dhi.mobilecoach.client.R;

import java.io.FileNotFoundException;

import static org.c4dhi.mobilecoach.client.Config.DymandFGServiceRunning;


public class DymandFGService extends Service implements DataClient.OnDataChangedListener, MessageClient.OnMessageReceivedListener,
        CapabilityClient.OnCapabilityChangedListener{

    public static final String CHANNEL_ID = "DymandNotificationInitialChannel";
    private static final String LOG_TAG = "Logs: DymandFGService";

    //------Receiving signals-START----------

    // user intent signal recording done
    private static final String RECORDING_DONE_PATH = "/recording_done";

    // self report has-completed ACK signal
    private static final String SELF_REPORT_COMPLETED_ACK_PATH = "/hasCompletedSelfReportACK";

    //------Receiving signals-END----------


    //------Sending signals-START----------

    // self report has-started signal
    private static final String SELF_REPORT_STARTED_PATH = "/hasStartedSelfReport";
    private static final String SELF_REPORT_STARTED_KEY = "ch.ethz.dymand.hasStartedSelfReport";
    private static final String SELF_REPORT_STARTED_MESSAGE = "SelfReportStarted";

    // self report has-completed signal
    private static final String SELF_REPORT_COMPLETED_PATH = "/hasCompletedSelfReport";
    private static final String SELF_REPORT_COMPLETED_KEY = "ch.ethz.dymand.hasCompletedSelfReport";
    private static final String SELF_REPORT_COMPLETED_MESSAGE = "SelfReportSelfReport";

    // Get config signal (message is the configuration)
    private static final String GET_CONFIG_PATH = "/getconfig";
    private static final String GET_CONFIG_KEY = "dymand.get.config.key";
    PowerManager.WakeLock wakeLock = null;

    //------Sending signals-END----------

    int ONGOING_NOTIFICATION_ID = 123456789;
    public static final String INTENT_STRING_MODULE_2_SERVICE = "DYMAND_MODULE_2_SERVICE";
    public static final String INTENT_STRING_SERVICE_2_MODULE = "DYMAND_SERVICE_2_MODULE";

    private static PowerManager.WakeLock lockStatic=null;

    public DymandFGService() {
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(LOG_TAG, "onCreate");

        Wearable.getDataClient(this).addListener(this ).addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                Log.i(LOG_TAG, "Success while adding listener");
            }
        });
        /*Log.i(LOG_TAG, "Acquiring wake lock - for the full run of App");
        PowerManager powerManager = (PowerManager) this.getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "Dymand::Service wake lock");
        wakeLock.acquire();*/

    }

    public void periodicLogs() {
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.i(LOG_TAG, "The service is lit!!");
                periodicLogs();
            }
        }, Config.periodicLogsInMin * 60 * 1000);
    }

    public static void acquireStaticLock(Context context) {
        getLock(context).acquire();
    }

    synchronized private static PowerManager.WakeLock getLock(Context context) {
        if (lockStatic==null) {
            PowerManager
                    mgr=(PowerManager)context.getSystemService(Context.POWER_SERVICE);
            lockStatic=mgr.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                    "LOCK_NAME_STATIC");
            lockStatic.setReferenceCounted(true);
        }
        return(lockStatic);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        //if (wakeLock != null) wakeLock.release();
        DymandFGServiceRunning = false;
        Log.i(LOG_TAG, "The Dymand foreground service is destroyed!!!!");
        lockStatic.release();
        lockStatic = null;
        sendBroadcastToRestartService();
    }

    private void sendBroadcastToRestartService() {
        Intent intent = new Intent(INTENT_STRING_SERVICE_2_MODULE);
        intent.putExtra("message", "restartService");
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i(LOG_TAG, "onStartCommand");
        Notification notification = null;
        Intent notificationIntent = new Intent(getApplicationContext(), MainActivity.class);
        PendingIntent pendingIntent =
                PendingIntent.getActivity(this, 0, notificationIntent, 0);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(CHANNEL_ID,
                    "Dymand Foreground Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
            notification =
                    new NotificationCompat.Builder(this, CHANNEL_ID)
                            .setContentTitle(getText(R.string.notification_title))
                            .setContentText(getText(R.string.notification_message_dymand))
                            .setSmallIcon(R.drawable.ic_notification)
                            .setPriority(NotificationCompat.PRIORITY_MAX)
                            .setContentIntent(pendingIntent)
                            .setOngoing(true)
                            .build();

        }
        else {
            notification =
                    new Notification.Builder(this)
                            .setContentTitle(getText(R.string.notification_title))
                            .setContentText(getText(R.string.notification_message_dymand))
                            .setSmallIcon(R.drawable.ic_notification)
                            .setContentIntent(pendingIntent)
                            .setOngoing(true)
                            .build();
        }

        startForeground(ONGOING_NOTIFICATION_ID, notification);
        Log.i(LOG_TAG, "startForeground dymand service");
        registerLocalBroadcastEvents();
        periodicLogs();
        return START_STICKY;
    }


    // Registering broadcast from DymandServiceModule to receive signals.
    private void registerLocalBroadcastEvents() {
        final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.i(LOG_TAG, "The broadcast message from module is received");
                Bundle extras = intent.getExtras();
                if(extras == null) {
                    Log.w(LOG_TAG, "Extras is null");
                }
                else {
                    final String value = (String) extras.get("message");
                    String [] tokens = value.split(" ");

                    switch (tokens[0]) {
                        case "sendConfig":
                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    sendConfig(value);
                                }
                            }).start();
                            break;

                        case "hasStartedSelfReportSignal":
                            sendHasStartedSelfReportSignal();
                            break;

                        case "selfReportCompletedSignal":
                            sendSelfReportCompletedSignal();
                            break;

                        default:
                            Log.w(LOG_TAG, "Unknown message");
                            break;
                    }

                }
            }
        };
        LocalBroadcastManager.getInstance(this).registerReceiver(broadcastReceiver, new IntentFilter(INTENT_STRING_MODULE_2_SERVICE));
    }



    private void sendSelfReportCompletedSignal() {
        Log.i(LOG_TAG, "Sending selfReportCompletedSignal.");
        PutDataMapRequest putDataMapReq = PutDataMapRequest.create(SELF_REPORT_COMPLETED_PATH);
        final String toSend = SELF_REPORT_COMPLETED_MESSAGE + (System.currentTimeMillis()%100000);
        putDataMapReq.getDataMap().putString(SELF_REPORT_COMPLETED_KEY, toSend);
        PutDataRequest putDataReq = putDataMapReq.asPutDataRequest();
        putDataReq.setUrgent();
        Wearable.getDataClient(this).putDataItem(putDataReq).addOnSuccessListener(new OnSuccessListener<DataItem>() {
            @Override
            public void onSuccess(DataItem dataItem) {
                Log.i(LOG_TAG, "Sending selfReportCompletedSignal was successful: " + toSend+ " " + dataItem);
            }
        });
    }

    private void sendHasStartedSelfReportSignal() {
        Log.i(LOG_TAG, "Sending HasStartedSelfReportSignal.");
        PutDataMapRequest putDataMapReq = PutDataMapRequest.create(SELF_REPORT_STARTED_PATH);
        final String toSend = SELF_REPORT_STARTED_MESSAGE + (System.currentTimeMillis()%100000);
        putDataMapReq.getDataMap().putString(SELF_REPORT_STARTED_KEY, toSend);
        PutDataRequest putDataReq = putDataMapReq.asPutDataRequest();
        putDataReq.setUrgent();
        Wearable.getDataClient(this).putDataItem(putDataReq).addOnSuccessListener(new OnSuccessListener<DataItem>() {
            @Override
            public void onSuccess(DataItem dataItem) {
                Log.i(LOG_TAG, "Sending HasStartedSelfReportSignal was successful: " + toSend+ " " + dataItem);
            }
        });
    }

    private void sendConfig(String configuration) {
        Log.i(LOG_TAG, "Sending configuration.");;
        PutDataMapRequest putDataMapReq = PutDataMapRequest.create(GET_CONFIG_PATH);
        final String toSend = configuration+ " " + (System.currentTimeMillis()%100000);
        putDataMapReq.getDataMap().putString(GET_CONFIG_KEY, toSend);
        PutDataRequest putDataReq = putDataMapReq.asPutDataRequest();
        putDataReq.setUrgent();
        Wearable.getDataClient(this).putDataItem(putDataReq).addOnSuccessListener(new OnSuccessListener<DataItem>() {
            @Override
            public void onSuccess(DataItem dataItem) {
                Log.i(LOG_TAG, "Sending configuration was successful: " + toSend+ " " + dataItem);
            }
        });
    }

    private void sendToModuleUserIntentRecordingDone() {
        Log.i(LOG_TAG, "Broadcasting user intent recording done.");
        try {
            Intent intent = new Intent(INTENT_STRING_SERVICE_2_MODULE);
            intent.putExtra("message", "recordingDone");
            LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendToModuleUserIntentSelfReportDoneACK() {
        Log.i(LOG_TAG, "Broadcasting user intent SelfReportACK.");
        try {
            Intent intent = new Intent(INTENT_STRING_SERVICE_2_MODULE);
            intent.putExtra("message", "SelfReportDoneACK");
            LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDataChanged(@NonNull DataEventBuffer dataEventBuffer) {
        Log.i(LOG_TAG, "onDataChanged in mobile.");
        for (DataEvent event : dataEventBuffer) {
            if (event.getType() == DataEvent.TYPE_CHANGED) {
                // DataItem changed
                Log.i(LOG_TAG, "onDataChanged data event - changed.");
                DataItem item = event.getDataItem();
                if (item.getUri().getPath().compareTo(RECORDING_DONE_PATH) == 0) {
                    DataMap dataMap = DataMapItem.fromDataItem(item).getDataMap();
                    Log.i(LOG_TAG, "User intent to be sent - recording done and URI is: " + item.getUri());
                    Wearable.getDataClient(this).deleteDataItems(item.getUri());
                    sendToModuleUserIntentRecordingDone();
                }
                if (item.getUri().getPath().compareTo(SELF_REPORT_COMPLETED_ACK_PATH) == 0) {
                    DataMap dataMap = DataMapItem.fromDataItem(item).getDataMap();
                    Log.i(LOG_TAG, "User intent to be sent - Self Report ack received and URI is: " + item.getUri());
                    Wearable.getDataClient(this).deleteDataItems(item.getUri());
                    sendToModuleUserIntentSelfReportDoneACK();
                }

            } else if (event.getType() == DataEvent.TYPE_DELETED) {
                // DataItem deleted
            }
        }

    }

    @Override
    public void onCapabilityChanged(@NonNull CapabilityInfo capabilityInfo) {

    }

    @Override
    public void onMessageReceived(@NonNull MessageEvent messageEvent) {

    }
}
