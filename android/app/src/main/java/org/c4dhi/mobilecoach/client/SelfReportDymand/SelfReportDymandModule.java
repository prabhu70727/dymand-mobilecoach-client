package org.c4dhi.mobilecoach.client.SelfReportDymand;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

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
  public void show(String arguments){
    //Activity currentActivity = getCurrentActivity();
    Intent intent = new Intent(this.getReactApplicationContext(), SelfReportDymandActivity.class);
    Bundle bundle = new Bundle();
    bundle.putString("extras", arguments); //Your id
    intent.putExtras(bundle); //Put your id to your next Intent
    this.getReactApplicationContext().startActivity(intent);
  }

}
