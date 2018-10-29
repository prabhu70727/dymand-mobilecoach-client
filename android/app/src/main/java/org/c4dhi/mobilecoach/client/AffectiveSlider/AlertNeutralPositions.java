package org.c4dhi.mobilecoach.client.AffectiveSlider;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;

import org.c4dhi.mobilecoach.client.R;

public class AlertNeutralPositions extends DialogFragment {
  public static AlertListener mAlertCallback;

  @Override
  public Dialog onCreateDialog(Bundle savedInstanceState) {
    // Use the Builder class for convenient dialog construction
    AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
    builder.setMessage(R.string.alert_neutral_positions)
      .setPositiveButton(R.string.yes, new DialogInterface.OnClickListener() {
        public void onClick(DialogInterface dialog, int id) {
          // Return to the AffectiveSlider activity
          dialog.dismiss();
        }
      })
      .setNegativeButton(R.string.no, new DialogInterface.OnClickListener() {
        public void onClick(DialogInterface dialog, int id) {
          mAlertCallback.returnAndFinish();
        }
      });
    // Create the AlertDialog object and return it
    return builder.create();
  }

  public interface AlertListener {
    void returnAndFinish();
  }


}
