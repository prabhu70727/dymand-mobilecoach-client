package org.c4dhi.mobilecoach.client.BackgroundVideoRecording;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.PixelFormat;
import android.hardware.Camera;
import android.hardware.camera2.CameraManager;
import android.media.CamcorderProfile;
import android.media.MediaRecorder;
import android.os.Build;
import android.os.Handler;
import android.support.annotation.RequiresApi;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;
import android.view.Gravity;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.WindowManager;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.IOException;

import static android.content.Context.CAMERA_SERVICE;


class BackgroundVideoRecordingModule extends ReactContextBaseJavaModule implements SurfaceHolder.Callback {

    private static String LOG_TAG = "Logs: BackgroundVideoRecordingModule";
    private Camera mCamera;
    private SurfaceView surfaceView;
    private WindowManager windowManager;
    private MediaRecorder mMediaRecorder;
    private Handler mHandler;
    private int mRecordingTimeInSeconds = 3;


    public BackgroundVideoRecordingModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BackgroundVideoRecordingModule";
    }

    @ReactMethod
    public void recordFrontCamera(String recordingTimeString) {
        Log.i(LOG_TAG, recordingTimeString);
        char timeChoice = recordingTimeString.charAt(recordingTimeString.length() - 1);

        if (timeChoice == 's') {
            mRecordingTimeInSeconds = Integer.parseInt(recordingTimeString.substring(0, recordingTimeString.length() - 1));
        } else {
            Log.e(LOG_TAG, "not supported");
        }

        Camera.Parameters parameters;
        initializeTheView();

    }

    private void initializeTheView() {
        mCamera = getCamera();
        windowManager = (WindowManager) this.getReactApplicationContext().getSystemService(Context.WINDOW_SERVICE);
        surfaceView = new SurfaceView(this.getReactApplicationContext());

        int LAYOUT_FLAG;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            LAYOUT_FLAG = WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY;
        }

        WindowManager.LayoutParams layoutParams = new WindowManager.LayoutParams(
                1, 1,
                LAYOUT_FLAG,
                WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
                PixelFormat.TRANSLUCENT
        );

        layoutParams.gravity = Gravity.LEFT | Gravity.TOP;
        windowManager.addView(surfaceView, layoutParams);
        surfaceView.getHolder().addCallback(this);
    }

    private Camera getCamera() {
        Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
        for (int camIdx = 0; camIdx < Camera.getNumberOfCameras(); camIdx++) {
            Camera.getCameraInfo(camIdx, cameraInfo);
            if (cameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
                try {
                    return mCamera = Camera.open(camIdx);
                } catch (RuntimeException e) {
                    e.printStackTrace();
                    Toast.makeText(getReactApplicationContext(), "Camera not available!", Toast.LENGTH_LONG).show();
                }
            }
        }
        return null;
    }


    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        mMediaRecorder = new MediaRecorder();
        mCamera.unlock();
        mMediaRecorder.setPreviewDisplay(holder.getSurface());
        mMediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
        mMediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);
        mMediaRecorder.setProfile(CamcorderProfile.get(Camera.CameraInfo.CAMERA_FACING_FRONT, CamcorderProfile.QUALITY_HIGH));

        File videoFileDir = new File(System.currentTimeMillis()+"");
        if(!videoFileDir.exists()){
            videoFileDir.mkdir();
        }

        mMediaRecorder.setOutputFile(videoFileDir+"/"+"videoRecording"+".3gp");
        try {
            mMediaRecorder.prepare();
        } catch (IOException e) {
            e.printStackTrace();
        }
        mMediaRecorder.start();
        mHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                stopRecordingFrontCamera();
            }
        },mRecordingTimeInSeconds *1000);
    }

    private void stopRecordingFrontCamera() {
        if ((mMediaRecorder == null)) throw new AssertionError();
        if ((mCamera == null)) throw new AssertionError();
        mMediaRecorder.stop();
        mMediaRecorder.reset();
        mMediaRecorder.release();
        mCamera.stopPreview();
        mCamera.release();
        mCamera = null;
        mMediaRecorder = null;
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {

    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {

    }
}
