package org.c4dhi.mobilecoach.client;

import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ForegroundServiceModule extends ReactContextBaseJavaModule {

    public Intent mService = null;
    private static final String LOG_TAG = "Logs: FGServiceModule";
    //public Controller controller = new Controller();
    public boolean interventionServiceRunning = false;
    public boolean initialServiceRunning = false;

    public ForegroundServiceModule(ReactApplicationContext reactContext){
        super(reactContext);
        BroadcastReceiver geoLocationReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.i(LOG_TAG, "The broadcast message to send user intent is received");
                ForegroundServiceModule.this.sendIntent();
            }
        };
        LocalBroadcastManager.getInstance(getReactApplicationContext()).registerReceiver(geoLocationReceiver, new IntentFilter("UserIntent"));
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
        return "ForegroundServiceModule";
    }

    @ReactMethod
    public void startInitialService(Promise promise) {
        //Toast.makeText(getReactApplicationContext(), "Trying to start initial service...", Toast.LENGTH_SHORT).show();
        if(initialServiceRunning) return;
        if(interventionServiceRunning) return;
        Log.i(LOG_TAG, "Foreground services count: " + getFGServiceCount());
        Log.i(LOG_TAG, "Checking whether the required service exists..." );

        if(isMyServiceRunning(InitialFGService.class) || isMyServiceRunning(InterventionFGService.class)) {
            Toast.makeText(getReactApplicationContext(), "Service exists. Kill it before starting a new one...", Toast.LENGTH_SHORT).show();
            return;
        }

        String result = "Success";
        initialServiceRunning = true;
        mService = new Intent(this.getReactApplicationContext(), InitialFGService.class);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(mService);
                Log.i(LOG_TAG, "StartForegroundService");
            } else {
                getReactApplicationContext().startService(mService);
                Log.i(LOG_TAG, "StartService");
            }
            Toast.makeText(getReactApplicationContext(), "Android: initial service start", Toast.LENGTH_SHORT).show();
        }
        catch (Exception e){
            promise.reject(e);
            return;
        }
        promise.resolve(result);
    }

    public void sendIntent()
    {
        Log.i(LOG_TAG, "User intent is being sent... ");
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("USER_INTENT_LISTENER_TAG", null);
    }

    @ReactMethod
    public void stopInitialService() {
        if(!initialServiceRunning) return;
        getReactApplicationContext().stopService(mService);
        mService = null;
        initialServiceRunning = false;
        Toast.makeText(getReactApplicationContext(), "Android: initial service stopped", Toast.LENGTH_SHORT).show();
    }

    @ReactMethod
    public void stopInterventionService() {
        if(!interventionServiceRunning) return;
        getReactApplicationContext().stopService(mService);
        mService = null;
        interventionServiceRunning = false;
        Toast.makeText(getReactApplicationContext(), "Android: intervention service stopped", Toast.LENGTH_SHORT).show();
    }


    @ReactMethod
    public void startInterventionService(Promise promise) {
        if(initialServiceRunning) return;
        if(interventionServiceRunning) return;
        Log.i(LOG_TAG, "Foreground services count: " + getFGServiceCount());
        Log.i(LOG_TAG, "Checking whether the required service exists..." );
        if(isMyServiceRunning(InitialFGService.class) || isMyServiceRunning(InterventionFGService.class)) {
            Toast.makeText(getReactApplicationContext(), "Service exists. Kill it before starting a new one...", Toast.LENGTH_SHORT).show();
            return;
        }
        String result = "Success";
        interventionServiceRunning = true;
        mService = new Intent(this.getReactApplicationContext(), InterventionFGService.class);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getReactApplicationContext().startForegroundService(mService);
            } else {
                getReactApplicationContext().startService(mService);
            }
            Toast.makeText(getReactApplicationContext(), "Android: Intervention service start", Toast.LENGTH_SHORT).show();
        }
        catch (Exception e){
            promise.reject(e);
            return;
        }
        promise.resolve(result);
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
