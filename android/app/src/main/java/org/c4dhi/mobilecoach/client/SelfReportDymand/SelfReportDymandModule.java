package org.c4dhi.mobilecoach.client.SelfReportDymand;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SelfReportDymandModule extends ReactContextBaseJavaModule {

  public SelfReportDymandModule(ReactApplicationContext reactContext)  {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "SelfReportDymandModule";
  }

  @ReactMethod
  public void show(){
    Activity currentActivity = getCurrentActivity();
    //ReactApplicationContext context = getReactApplicationContext();
    Intent intent = new Intent(currentActivity, SelfReportDymandActivity.class);
    currentActivity.startActivity(intent);
  }

}
