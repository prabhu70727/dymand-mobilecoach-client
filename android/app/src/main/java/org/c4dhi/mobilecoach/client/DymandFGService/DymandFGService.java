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
import android.os.IBinder;
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

import org.c4dhi.mobilecoach.client.LocalTimer;
import org.c4dhi.mobilecoach.client.MainActivity;
import org.c4dhi.mobilecoach.client.R;

import java.io.FileNotFoundException;


public class DymandFGService extends Service implements DataClient.OnDataChangedListener, MessageClient.OnMessageReceivedListener,
        CapabilityClient.OnCapabilityChangedListener{

    public static final String CHANNEL_ID = "DynamdNotificationInitialChannel";
    private static final String LOG_TAG = "Logs: DymandFGService";

    // user intent signal recording done
    private static final String RECORDING_DONE_PATH = "/recording_done";
    private static final String RECORDING_DONE_KEY = "ch.ethz.dymand.recording_done";
    private static final String RECORDING_DONE_MESSAGE = "RD";

    // self report has-started signal
    private static final String SELF_REPORT_STARTED_PATH = "/hasStartedSelfReport";
    private static final String SELF_REPORT_STARTED_KEY = "ch.ethz.dymand.hasStartedSelfReport";
    private static final String SELF_REPORT_STARTED_MESSAGE = "SelfReportStarted";

    // self report has-completed signal
    private static final String SELF_REPORT_COMPLETED_PATH = "/hasCompletedSelfReport";
    private static final String SELF_REPORT_COMPLETED_KEY = "ch.ethz.dymand.hasCompletedSelfReport";
    private static final String SELF_REPORT_COMPLETED_MESSAGE = "SelfReportSelfReport";

    // self report has-completed ACK signal
    private static final String SELF_REPORT_COMPLETED_ACK_PATH = "/hasCompletedSelfReportACK";
    private static final String SELF_REPORT_COMPLETED_ACK_KEY = "ch.ethz.dymand.hasCompletedSelfReportACK";
    private static final String SELF_REPORT_COMPLETED_ACK_MESSAGE = "SelfReportSelfReportACK";


    private static final String GET_CONFIG = "/getconfig";
    private static final String KEEP_RECORDING = "/DYMAND_KEEP_RECORDING";
    private static final String USER_INTENT = "/DYMAND_USER_INTENT";

    // Get config signal
    private static final String GET_CONFIG_KEY = "dymand.get.config.key";
    private static final String GET_CONFIG_ACK = "DYMAND_GET_CONFIG_ACK";
    public static boolean configSentAndACKReceived = false;

    // Keep recording signal
    private static final String KEEP_RECORDING_KEY = "DYMAND_KEEP_RECORDING_KEY";
    private static final String KEEP_RECORDING_MESSAGE = "DYMAND_KEEP_RECORDING_START";
    private static final String KEEP_RECORDING_ACK = "DYMAND_KEEP_RECORDING_ACK";
    public static boolean keepRecordingSent = false;

    //  signal
    private static final String USER_INTENT_KEY = "DYMAND_GET_CONFIG_KEY_KEY";
    private static final String USER_INTENT_MESSAGE = "DYMAND_USER_INTENT_START";
    private static final String USER_INTENT_ACK = "DYMAND_USER_INTENT_ACK";


    int ONGOING_NOTIFICATION_ID = 123456789;
    public static final String INTENT_STRING_MODULE_2_SERVICE = "DYMAND_MODULE_2_SERVICE";
    public static final String INTENT_STRING_SERVICE_2_MODULE = "DYMAND_SERVICE_2_MODULE";

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
        return START_NOT_STICKY;
    }

    private void registerLocalBroadcastEvents() {
        final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.i(LOG_TAG, "The broadcast message is received");
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
                Log.i(LOG_TAG, "Sending intent was successful: " + toSend+ " " + dataItem);
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
                Log.i(LOG_TAG, "Sending intent was successful: " + toSend+ " " + dataItem);
            }
        });
    }

    private void sendConfig(String configuration) {
        Log.i(LOG_TAG, "Sending configuration.");
        configSentAndACKReceived = false;
        while (!configSentAndACKReceived){
            PutDataMapRequest putDataMapReq = PutDataMapRequest.create(GET_CONFIG);
            putDataMapReq.getDataMap().putString(GET_CONFIG_KEY, configuration);
            PutDataRequest putDataReq = putDataMapReq.asPutDataRequest();
            putDataReq.setUrgent();
            Wearable.getDataClient(this).putDataItem(putDataReq).addOnSuccessListener(new OnSuccessListener<DataItem>() {
                @Override
                public void onSuccess(DataItem dataItem) {
                    Log.i(LOG_TAG, "Sending configuration was successful: " + dataItem);
                }
            });
            LocalTimer.blockingLoop(5000);
            //Wearable.getDataClient(this).deleteDataItems(putDataReq.getUri());
        }
        Log.i(LOG_TAG, "Configuration sent successfully with ACK.");
        sendToModuleUserIntentConfigSent();
    }

    private void sendToModuleUserIntentConfigSent() {
        Log.i(LOG_TAG, "Broadcasting user intent config sent.");
        try {
            Intent intent = new Intent(INTENT_STRING_SERVICE_2_MODULE);
            intent.putExtra("message", "configSent");
            LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
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
                if (item.getUri().getPath().compareTo(GET_CONFIG) == 0) {
                    DataMap dataMap = DataMapItem.fromDataItem(item).getDataMap();
                    if(dataMap.getString(GET_CONFIG_KEY).equals(GET_CONFIG_ACK)){
                        configSentAndACKReceived = true;
                    }
                }
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
