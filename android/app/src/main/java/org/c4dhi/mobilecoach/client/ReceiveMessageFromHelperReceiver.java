package org.c4dhi.mobilecoach.client;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.io.File;
import java.io.FileWriter;
import java.sql.Timestamp;
import java.util.Date;

public class ReceiveMessageFromHelperReceiver extends BroadcastReceiver {
  private String LOG_TAG = "Logs: ReceiveMessageFromHelperReceiver";

  @Override
  public void onReceive(Context context, Intent intent) {
    Log.d(LOG_TAG, "Message from helper received");
    File file = new File(context.getFilesDir(),"BroadCastHelperLog");
    if(!file.exists()){
      file.mkdir();
    }
    try{
      File timeStamps = new File(file, "timestamps");
      FileWriter writer = new FileWriter(timeStamps, true);
      Timestamp ts=new Timestamp(System.currentTimeMillis());
      Date date=new Date(ts.getTime());
      writer.append(date+"\n");
      writer.flush();
      writer.close();

    }catch (Exception e){
      e.printStackTrace();
    }
  }
}
