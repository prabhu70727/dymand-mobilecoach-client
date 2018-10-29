package org.c4dhi.mobilecoach.client.SelfReportDymand;

import android.content.Context;
import android.hardware.Camera;
import android.media.CamcorderProfile;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.PowerManager;
import android.support.annotation.RequiresApi;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;
import android.widget.SeekBar;
import android.widget.Toast;

import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.c4dhi.mobilecoach.client.R;
import org.c4dhi.mobilecoach.client.Sensors.SensorRecorder;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;

public class SelfReportDymandActivity extends AppCompatActivity
        implements SurfaceHolder.Callback {

    private static String LOG_TAG = "Logs: SelfReportDymandActivity";

    private int mRecordingTimeInSeconds = 3;
    private Camera mCamera;
    private boolean mRecording = false;
    private SurfaceView mSurfaceView;
    private SurfaceHolder mSurfaceHolder;
    private MediaRecorder mMediaRecorder;
    private Handler mHandler, mClickHandler;
    private long mStoppingTime;
    SensorRecorder mSensorRecorder;
    private File mArousalFile;
    private File mPleasureFile;
    private String mDirectory;

    private int finishTimeInMin = 5; // 5 minutes to close the App
    private boolean mWakeLockAcquired = false;
    private PowerManager mPowerManager;
    private PowerManager.WakeLock mWakeLock;
    private Handler mWakeLockHandler;
    private Runnable mWakeLockRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i(LOG_TAG, "OnCreate");

        // set timer for non-activity for 10 minutes
        inactiveFinishActivity();

        super.onCreate(savedInstanceState);
        int random = new Random().nextInt(2);
        if (random == 0) setContentView(R.layout.activity_affective_slider);
        else setContentView(R.layout.activity_affective_slider_inverse);

        // Button is initially false
        Button weiter = (Button) findViewById(R.id.contA);
        weiter.setEnabled(false);
        SeekBar em = (SeekBar) findViewById(R.id.emotion);
        em.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {

            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                // Button set to true on touch event
                Button weiter = (Button) findViewById(R.id.contA);
                weiter.setEnabled(true);
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });
        SeekBar a = (SeekBar) findViewById(R.id.arousal);
        a.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                // Button set to true on touch event
                Button weiter = (Button) findViewById(R.id.contA);
                weiter.setEnabled(true);
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {

            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {

            }
        });

        try {
            createFilesAndFolder();
        } catch (IOException e) {
            e.printStackTrace();
        }
        intitalizeCamera();
    }

    // todo test it...
    private void inactiveFinishActivity() {
        mPowerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        mWakeLock = mPowerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "Dymand::TimedWakeLockSliderRemove");
        if(!mWakeLockAcquired) {
            mWakeLock.acquire();
            mWakeLockAcquired = true;
        }
        mWakeLockHandler = new Handler();
        mWakeLockRunnable = new Runnable() {
            @Override
            public void run() {
                Log.i(LOG_TAG, "Releasing wake lock and finish activity");
                finishActivity(); // releasing wake lock inside this function
            }
        };
        mWakeLockHandler.postDelayed(mWakeLockRunnable, finishTimeInMin * 60 * 1000);
    }

    private void createFilesAndFolder() throws IOException {
        mDirectory = this.getFilesDir() + "/Recordings/" + new SimpleDateFormat("yyyy_MM_dd_HH_mm_ss").format(new Date());
        File videoFileDir = new File(mDirectory, "");
        if(!videoFileDir.exists()){
            Log.i(LOG_TAG, "Creating directory");
            videoFileDir.mkdirs();
        }
        mArousalFile = new File(mDirectory, "ArousalStateLogs");
        mPleasureFile = new File(mDirectory, "PleasureStateLogs");

        if (!mArousalFile.exists()) {
            mArousalFile.createNewFile();
        }
        if (!mPleasureFile.exists()) {
            mPleasureFile.createNewFile();
        }
    }


    public void intitalizeCamera() {
        Log.i(LOG_TAG, "intitalizeCamera");
        mCamera = getCamera();
        mSurfaceView = (SurfaceView) findViewById(R.id.surface_camera);
        mSurfaceHolder = mSurfaceView.getHolder();
        mSurfaceHolder.addCallback(this);
    }

    private Camera getCamera() {
        Log.i(LOG_TAG, "getCamera");
        Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
        for (int camIdx = 0; camIdx < Camera.getNumberOfCameras(); camIdx++) {
            Camera.getCameraInfo(camIdx, cameraInfo);
            if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
                try {
                    return mCamera = Camera.open(camIdx);
                } catch (RuntimeException e) {
                    e.printStackTrace();
                    Log.i(LOG_TAG, "Camera not available!");
                }
            }
        }
        Log.i(LOG_TAG, "Camera is null");
        return null;
    }


    public void onClickNext(View view) throws IOException {
        Log.i(LOG_TAG, "onClickNext");

        SeekBar em = (SeekBar) findViewById(R.id.emotion);
        SeekBar a = (SeekBar) findViewById(R.id.arousal);
        int progressArousal = a.getProgress();
        int progressPleasure = em.getProgress();

        Button weiter = (Button) findViewById(R.id.contA);
        weiter.setEnabled(false);

        writeAffectIntoFileAndfinish(progressArousal, progressPleasure);
    }


    public void writeAffectIntoFileAndfinish(int progressArousal, int progressPleasure) throws IOException {
        FileOutputStream arousalFileStream = new FileOutputStream(mArousalFile);
        FileOutputStream pleasureFileStream = new FileOutputStream(mPleasureFile);
        String timestamp = System.currentTimeMillis() + "";
        arousalFileStream.write((timestamp + "," + Integer.toString(progressArousal)).getBytes());
        pleasureFileStream.write((timestamp + "," + Integer.toString(progressPleasure)).getBytes());
        pleasureFileStream.close();
        arousalFileStream.close();

        long curTime = System.currentTimeMillis();
        if(mStoppingTime < curTime){
            finishActivity();
        }
        else {
            mClickHandler = new Handler();
            mClickHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    finishActivity();
                }
            }, mStoppingTime - curTime+500);
        }
    }

    synchronized private void finishActivity() {
        if(mWakeLockAcquired && mWakeLock!=null) {
            mWakeLock.release();
            mWakeLockAcquired = false;
        }
        if(mWakeLockHandler != null && mWakeLockHandler != null) mWakeLockHandler.removeCallbacks(mWakeLockRunnable);
        this.finish();
    }


    @RequiresApi(api = Build.VERSION_CODES.KITKAT_WATCH)
    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        Log.i(LOG_TAG, "surfaceCreated");

        String curTime = System.currentTimeMillis() + "";
        try {
            startRecording(curTime, holder);
        } catch (IOException e) {
            e.printStackTrace();
        }
        mHandler = new Handler();
        mHandler.postDelayed(new Runnable() {
            @RequiresApi(api = Build.VERSION_CODES.KITKAT)
            @Override
            public void run() {
                try {
                    stopRecording();
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                }
            }
        },mRecordingTimeInSeconds *1000);
        mStoppingTime = System.currentTimeMillis() + mRecordingTimeInSeconds *1000;

    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT_WATCH)
    private void startRecording(String curTime, SurfaceHolder holder) throws IOException {
        startRecordingVideo(mDirectory, holder);
        startRecordingSensor(mDirectory);
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT_WATCH)
    private void startRecordingSensor(String dirPath) throws IOException {
        mSensorRecorder = new SensorRecorder(this);
        mSensorRecorder.startRecording(dirPath);
    }

    private void startRecordingVideo(String dirPath, SurfaceHolder holder) {
        mMediaRecorder = new MediaRecorder();
        mCamera.unlock();
        mMediaRecorder.setCamera(mCamera);
        mMediaRecorder.setPreviewDisplay(holder.getSurface());
        mMediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
        mMediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
        mMediaRecorder.setProfile(CamcorderProfile.get(Camera.CameraInfo.CAMERA_FACING_FRONT, CamcorderProfile.QUALITY_HIGH));
        mMediaRecorder.setOutputFile(dirPath+"/"+"videoRecording"+".3gp");
        try {
            mMediaRecorder.prepare();
        } catch (IOException e) {
            e.printStackTrace();
        }
        mMediaRecorder.start();
        mRecording = true;
        mStoppingTime = System.currentTimeMillis() + mRecordingTimeInSeconds *1000;
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    private void stopRecording() throws FileNotFoundException {
        stopRecordingFrontCamera();
        mSensorRecorder.stopRecording();
    }

    private void stopRecordingFrontCamera() {
        Log.i(LOG_TAG, "stopRecordingFrontCamera");
        if ((mMediaRecorder == null)) throw new AssertionError();
        if ((mCamera == null)) throw new AssertionError();
        mMediaRecorder.stop();
        mMediaRecorder.reset();
        mMediaRecorder.release();
        mCamera.stopPreview();
        mCamera.release();
        mCamera = null;
        mMediaRecorder = null;
        mHandler = null;
        mRecording = false;
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {

    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        Log.i(LOG_TAG, "surfaceDestroyed");
        if(mMediaRecorder != null){
            mMediaRecorder.stop();
            mMediaRecorder.reset();
            mMediaRecorder.release();
            mMediaRecorder = null;
        }
        if(mCamera != null){
            mCamera.stopPreview();
            mCamera.release();
            mCamera = null;
        }
    }

    @Override
    public void onBackPressed() {
        Toast.makeText(getApplicationContext(), "Bitte beenden Sie die Aufgabe und drücken Sie die WEITER-Taste, wenn Sie fertig sind..", Toast.LENGTH_LONG).show();
    }
}
