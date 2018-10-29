package org.c4dhi.mobilecoach.client;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import java.io.FileNotFoundException;


public class InitialFGService extends Service {

    public static final String CHANNEL_ID = "DynamdNotificationInitialChannel";
    private static final String LOG_TAG = "Logs: FGService";
    int ONGOING_NOTIFICATION_ID = 123456789;

    public InitialFGService() {
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(LOG_TAG, "onCreate");


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
                            .setContentText(getText(R.string.notification_message_initial))
                            .setSmallIcon(R.drawable.ic_notification)
                            .setContentIntent(pendingIntent)
                            .setOngoing(true)
                            .build();

        }
        else {
            notification =
                    new Notification.Builder(this)
                            .setContentTitle(getText(R.string.notification_title))
                            .setContentText(getText(R.string.notification_message_initial))
                            .setSmallIcon(R.drawable.ic_notification)
                            .setContentIntent(pendingIntent)
                            .setOngoing(true)
                            .build();
        }

        startForeground(ONGOING_NOTIFICATION_ID, notification);
        Log.i(LOG_TAG, "startForeground initial service");
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
                }
            }
        });
        t.start();
    }

    private void startProcess() throws FileNotFoundException {

        /*// Test to check intention, remove it later - START
        LocalTimer.blockingLoop(2000);
        Log.i(LOG_TAG, "fgservice user intent");
        try {
            Intent intent = new Intent("UserIntent");
            intent.putExtra("message", "");
            LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
        } catch (Exception e) {
            e.printStackTrace();
        }
        // Test to check intention, remove it later - END */

        // while (true);
        //stopForeground(true);
        //stopSelf();
    }
}
