package org.c4dhi.mobilecoach.client;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
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

import java.io.FileNotFoundException;


public class InterventionFGService extends Service implements DataClient.OnDataChangedListener,
  MessageClient.OnMessageReceivedListener,
  CapabilityClient.OnCapabilityChangedListener{

  public static final String CHANNEL_ID = "DynamdNotificationInterventionChannel";
  private static final String LOG_TAG = "Logs: IntervFGService";
  int ONGOING_NOTIFICATION_ID = 123456789;
  private static final String INTERVENE_KEY = "com.example.key.intervention";

  private static final String INTERVENTION = "/intervention";
  private static final String START_INTERVENTION_MESSAGE = "start_intervention";
  private static boolean sentStartIntervention = false;
  private static final String INTERVENTION_ACK = "intervention_ack";
  private static final String SEND_INTENT_MESSAGE = "send_intent";
  private static final String INTENT_ACK = "intent_ack";


  public InterventionFGService() {
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
              "Dymand Foregeound Service Channel",
              NotificationManager.IMPORTANCE_HIGH
      );
      NotificationManager manager = getSystemService(NotificationManager.class);
      manager.createNotificationChannel(serviceChannel);
      notification =
              new NotificationCompat.Builder(this, CHANNEL_ID)
                      .setContentTitle(getText(R.string.notification_title))
                      .setContentText(getText(R.string.notification_message_intervention))
                      .setSmallIcon(R.drawable.ic_notification)
                      .setContentIntent(pendingIntent)
                      .setOngoing(true)
                      .build();

    }
    else {
      notification =
              new Notification.Builder(this)
                      .setContentTitle(getText(R.string.notification_title))
                      .setContentText(getText(R.string.notification_message_intervention))
                      .setSmallIcon(R.drawable.ic_notification)
                      .setContentIntent(pendingIntent)
                      .setOngoing(true)
                      .build();
    }

    startForeground(ONGOING_NOTIFICATION_ID, notification);
    Log.i(LOG_TAG, "startForeground");
    startIntervention();
    return START_NOT_STICKY;
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void startIntervention() {
    Thread t = new Thread(new Runnable() {
      @Override
      public void run() {
        try {
          startProcess();
        } catch (FileNotFoundException e) {
          e.printStackTrace();
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    });
    t.start();
  }

  private void startProcess() throws FileNotFoundException, InterruptedException {
    int count = 0;
    while (true){
      LocalTimer.blockingLoop(2000);
      if(!sentStartIntervention) {
        sendStartInterventionMessage(START_INTERVENTION_MESSAGE);
      }
    }
    //stopForeground(true);
    //stopSelf();
  }


  private void sendStartInterventionMessage(String message) {
    PutDataMapRequest putDataMapReq = PutDataMapRequest.create(INTERVENTION);
    putDataMapReq.getDataMap().putString(INTERVENE_KEY, message + (System.currentTimeMillis()%100000));
    PutDataRequest putDataReq = putDataMapReq.asPutDataRequest();
    putDataReq.isUrgent();
    Wearable.getDataClient(this).putDataItem(putDataReq).addOnSuccessListener(new OnSuccessListener<DataItem>() {
      @Override
      public void onSuccess(DataItem dataItem) {
        Log.i(LOG_TAG, "Sending start intervention signal was successful: " + dataItem);
      }
    });
  }

  @Override
  public void onDataChanged(@NonNull DataEventBuffer dataEventBuffer) {
    Log.i(LOG_TAG, "onDataChanged in mobile.");
    for (DataEvent event : dataEventBuffer) {
      if (event.getType() == DataEvent.TYPE_CHANGED) {
        // DataItem changed
        DataItem item = event.getDataItem();
        if (item.getUri().getPath().compareTo(INTERVENTION) == 0) {
          DataMap dataMap = DataMapItem.fromDataItem(item).getDataMap();
          update(dataMap.getString(INTERVENE_KEY));
        }
      } else if (event.getType() == DataEvent.TYPE_DELETED) {
        // DataItem deleted
      }
    }
  }

  private void update(String string) {
    if(string.contains(INTERVENTION_ACK)){
      Log.i(LOG_TAG, "Start Intervention ack is received.");
      sentStartIntervention = true;
    }
    else if(string.contains(SEND_INTENT_MESSAGE)){
      Log.i(LOG_TAG, "------------USER INTENT RECEIVED------------");
      broadcastUserIntent();
      sendAckToWatch();
    }
  }

  private void broadcastUserIntent() {
    Log.i(LOG_TAG, "Broadcasting user intent");
    try {
      Intent intent = new Intent("UserIntent");
      intent.putExtra("message", "");
      LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private void sendAckToWatch() {
    PutDataMapRequest putDataMapReq = PutDataMapRequest.create(INTERVENTION);
    putDataMapReq.getDataMap().putString(INTERVENE_KEY, INTENT_ACK +  (System.currentTimeMillis()%100000));
    PutDataRequest putDataReq = putDataMapReq.asPutDataRequest();
    putDataReq.isUrgent();
    Wearable.getDataClient(this).putDataItem(putDataReq).addOnSuccessListener(new OnSuccessListener<DataItem>() {
      @Override
      public void onSuccess(DataItem dataItem) {
        Log.i(LOG_TAG, "Sending intention ack was successful: " + dataItem);
      }
    });
  }

  @Override
  public void onCapabilityChanged(@NonNull CapabilityInfo capabilityInfo) {

  }

  @Override
  public void onMessageReceived(@NonNull MessageEvent messageEvent) {

  }
}
