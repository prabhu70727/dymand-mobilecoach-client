package org.c4dhi.mobilecoach.client;

import android.app.Application;

import com.facebook.react.ReactApplication;

import fr.bamlab.rnimageresizer.ImageResizerPackage;

import com.zmxv.RNSound.RNSoundPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;

import org.c4dhi.mobilecoach.client.DymandFGService.DymandFGServicePackage;
import org.c4dhi.mobilecoach.client.SelfReportDymand.SelfReportDymandPackage;
import org.reactnative.camera.RNCameraPackage;

import com.github.wumke.RNExitApp.RNExitAppPackage;

import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;

import com.brentvatne.react.ReactVideoPackage;
import com.rnfs.RNFSPackage;

import de.bonify.reactnativepiwik.PiwikPackage;

import com.vinzscam.reactnativefileviewer.RNFileViewerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.smixx.fabric.FabricPackage;
import com.crashlytics.android.Crashlytics;

import io.fabric.sdk.android.Fabric;

import com.airbnb.android.react.lottie.LottiePackage;
import com.kishanjvaghela.cardview.RNCardViewPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.oblador.vectoricons.VectorIconsPackage;

import org.devio.rn.splashscreen.SplashScreenReactPackage;

import com.react.rnspinkit.RNSpinkitPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new ImageResizerPackage(),
                    new RNSoundPackage(),
                    new ReactNativeAudioPackage(),
                    new RNCameraPackage(),
                    new RNExitAppPackage(),
                    new RNSensitiveInfoPackage(),
                    new ReactVideoPackage(),
                    new RNFSPackage(),
                    new PiwikPackage(),
                    new RNFileViewerPackage(),
                    new RNFetchBlobPackage(),
                    new FabricPackage(),
                    new LottiePackage(),
                    new RNCardViewPackage(),
                    new ReactNativePushNotificationPackage(),
                    new VectorIconsPackage(),
                    new SplashScreenReactPackage(),
                    new RNSpinkitPackage(),
                    new RNI18nPackage(),
                    new RNDeviceInfo(),
                    new ReactNativeConfigPackage(),
                    new ForegroundServicePackage(),
                    new SelfReportDymandPackage(),
                    new DymandFGServicePackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Fabric.with(this, new Crashlytics());
        SoLoader.init(this, /* native exopackage */ false);
    }
}
