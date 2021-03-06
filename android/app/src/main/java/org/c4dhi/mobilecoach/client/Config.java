package org.c4dhi.mobilecoach.client;

import android.app.PendingIntent;
import android.hardware.Sensor;
import android.hardware.SensorManager;


public class Config {

    public static final int SENSOR_DELAY = SensorManager.SENSOR_DELAY_FASTEST;
    public static int[] sensorList = new int[]{
            Sensor.TYPE_LIGHT
    };
    public static final String SENSOR_FILE_EXTENSION = ".csv";
    public static boolean hasStartedSelfReport = false;
    public static boolean DymandFGServiceRunning = false;
    public static boolean onBoardingDone = false;
    public static int periodicLogsInMin = 30;
    public static int pendingIntentFlag = PendingIntent.FLAG_CANCEL_CURRENT;

    public static int webViewCloseTimerCount = 0;
}