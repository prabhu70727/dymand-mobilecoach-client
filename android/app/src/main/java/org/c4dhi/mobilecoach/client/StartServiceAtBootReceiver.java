package org.c4dhi.mobilecoach.client;

import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.Toast;

import org.c4dhi.mobilecoach.client.DymandFGService.DymandFGService;

import static org.c4dhi.mobilecoach.client.Config.DymandFGServiceRunning;


public class StartServiceAtBootReceiver extends BroadcastReceiver {
  private static final String LOG_TAG = "Logs: BootReceiver";
  private Intent mService = null;

  @Override
  public void onReceive(Context context, Intent intent) {
    SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(context);
    Config.onBoardingDone = sharedPref.getBoolean("isOnboardingDone", false);

    if(Config.onBoardingDone) {
      restartService(context);
    }
  }

  private void restartService(Context context) {
    //if(DymandFGServiceRunning) return;
    Log.i(LOG_TAG, "Foreground services count: " + getFGServiceCount(context));
    Log.i(LOG_TAG, "Checking whether the required service exists..." );

    if(isMyServiceRunning(DymandFGService.class, context)) {
      Toast.makeText(context, "Service exists. Kill it before starting a new one...", Toast.LENGTH_SHORT).show();
      return;
    }

    DymandFGService.acquireStaticLock(context);
    DymandFGServiceRunning = true;
    mService = new Intent(context, DymandFGService.class);
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(mService);
        Log.i(LOG_TAG, "StartForegroundService");
      } else {
        context.startService(mService);
        Log.i(LOG_TAG, "StartService");
      }
    }
    catch (Exception e){
      return;
    }
  }

  private boolean isMyServiceRunning(Class<?> serviceClass, Context context) {
    ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
    for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
      if (serviceClass.getName().equals(service.service.getClassName())) {
        return true;
      }
    }
    return false;
  }

  private int getFGServiceCount(Context context) {
    int count = 0;
    ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
    for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
      if (service.foreground){
        Log.i(LOG_TAG, service.service.getClassName());
        count++;
      }
    }
    return count;
  }

}
