package org.c4dhi.mobilecoach.client;

import android.hardware.Sensor;
import android.hardware.SensorManager;


public class Config {

    public static final int SENSOR_DELAY = SensorManager.SENSOR_DELAY_FASTEST;
    public static int[] sensorList = new int[]{
            Sensor.TYPE_LIGHT
    };
    public static final String SENSOR_FILE_EXTENSION = ".csv";
    public static boolean hasStartedSelfReport = false;

}