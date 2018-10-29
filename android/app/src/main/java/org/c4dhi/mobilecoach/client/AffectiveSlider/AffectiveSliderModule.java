package org.c4dhi.mobilecoach.client.AffectiveSlider;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AffectiveSliderModule extends ReactContextBaseJavaModule {

  public AffectiveSliderModule(ReactApplicationContext reactContext)  {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "AffectiveSliderModule";
  }

  @ReactMethod
  public void showSlider(){
    Activity currentActivity = getCurrentActivity();
    //ReactApplicationContext context = getReactApplicationContext();
    Intent intent = new Intent(currentActivity, AffectiveSliderActivity.class);
    currentActivity.startActivity(intent);
  }

}
