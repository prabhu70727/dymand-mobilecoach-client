package org.c4dhi.mobilecoach.client.AffectiveSlider;

import android.app.DialogFragment;
import android.os.Build;
import android.support.annotation.RequiresApi;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.SeekBar;

import org.c4dhi.mobilecoach.client.R;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Random;

public class AffectiveSliderActivity extends AppCompatActivity implements AlertNeutralPositions.AlertListener {

   int progressArousal;
   int progressPleasure;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    int random = new Random().nextInt(2);
    if(random == 0) setContentView(R.layout.activity_affective_slider);
    else setContentView(R.layout.activity_affective_slider_inverse);
  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  public void onClickNext(View view) throws IOException {
      SeekBar em = (SeekBar) findViewById(R.id.emotion);
      SeekBar a = (SeekBar) findViewById(R.id.arousal);

      progressArousal = a.getProgress();
      progressPleasure = em.getProgress();

      if(progressArousal == 50 || progressPleasure == 50){
          DialogFragment alertNeutralPositions = new AlertNeutralPositions();
          AlertNeutralPositions.mAlertCallback = this;
          alertNeutralPositions.show(getFragmentManager(),"alertNeutralPositions");
      }
      else {
          writeAffectIntoFileAndfinish();
      }

  }

  @RequiresApi(api = Build.VERSION_CODES.N)
  public void writeAffectIntoFileAndfinish() throws IOException {
      File arousalFile = new File(this.getDataDir(), "ArousalStateLogs");
      File pleasureFile = new File(this.getDataDir(), "PleasureStateLogs");

      if(!arousalFile.exists()){
          arousalFile.createNewFile();
      }
      if(!pleasureFile.exists()){
          pleasureFile.createNewFile();
      }
      FileOutputStream arousalFileStream = new FileOutputStream(arousalFile);
      FileOutputStream pleasureFileStream = new FileOutputStream(pleasureFile);
      String timestamp = System.currentTimeMillis()+"";
      arousalFileStream.write((timestamp+","+Integer.toString(progressArousal)).getBytes());
      pleasureFileStream.write((timestamp+","+Integer.toString(progressPleasure)).getBytes());
      pleasureFileStream.close();
      arousalFileStream.close();
      this.finish();
  }


    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    public void returnAndFinish() {
        try {
            writeAffectIntoFileAndfinish();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
