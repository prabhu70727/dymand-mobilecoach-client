package org.c4dhi.mobilecoach.client.Sensors;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.support.annotation.RequiresApi;
import android.util.Log;

import org.c4dhi.mobilecoach.client.Config;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


public class SensorRecorder implements SensorEventListener{
    private static final String LOG_TAG = "Logs: SensorRecorder";
    private static final int SENSOR_DELAY = Config.SENSOR_DELAY;
    SensorManager mSensorManager;
    public static int[] sensorList;
    public static boolean mRecording = false;
    public List<File> mFiles = null;
    private HashMap<String, StringBuilder> mSensorIndex = null;
    private String extension = Config.SENSOR_FILE_EXTENSION;

    public SensorRecorder(Context applicationContext){
        mSensorManager = (SensorManager) applicationContext.getSystemService(applicationContext.SENSOR_SERVICE);
        sensorList = Config.sensorList;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {

        String sensorName = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT_WATCH) {
            sensorName = event.sensor.getStringType();
        }
        else
        {
            Log.e(LOG_TAG, "Why does the OS have less API than 4.0");
        }

        StringBuilder toTrack = new StringBuilder(event.timestamp+","+event.accuracy);
        for(int i=0; i<event.values.length; i++) {
            toTrack.append("," + event.values[i]);
        }
        //Log.i(LOG_TAG, sensorName + "," + toTrack.toString());
        mSensorIndex.get(sensorName+extension).append(toTrack.toString()+"\n");
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {

    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    public void stopRecording() throws FileNotFoundException {
        if (mRecording) {
            mSensorManager.unregisterListener(this);
            mRecording = false;
            Log.i(LOG_TAG, "Stopped all sensor recording");

            if(mSensorIndex.isEmpty()) return;

            for(File file: mFiles){
                StringBuilder toWrite = mSensorIndex.get(file.getName());
                try (FileOutputStream stream = new FileOutputStream(file)) {
                    stream.write(toWrite.toString().getBytes());
                    stream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        else{
            Log.i(LOG_TAG, "All sensor recording already stopped");
        }
        mFiles = null;
        mSensorIndex = null;
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT_WATCH)
    public void startRecording(String dirPath) throws IOException {

        if (mRecording != false) throw new AssertionError();

        mFiles = new ArrayList<>();
        mSensorIndex = new HashMap<>();

        for(int sensorType:sensorList){

            Sensor sensor = mSensorManager.getDefaultSensor(sensorType);
            if(sensor == null) {
                Log.i(LOG_TAG, "Sensor of type "+ sensorType +" not available.");
                continue;
            }

            String sensorName = sensor.getStringType();
            //creating files
            File file = new File(dirPath, sensorName+extension);
            file.createNewFile();
            mFiles.add(file);
            StringBuilder init = new StringBuilder("");
            mSensorIndex.put(file.getName(), init);

            mSensorManager.registerListener(this, sensor, SENSOR_DELAY);
            Log.i(LOG_TAG, "Started sensor "+sensorName+ " and recording");
        }
        mRecording = true;
    }
}
