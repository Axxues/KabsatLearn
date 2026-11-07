package com.kabsatlearn.app;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Ensure web content respects system windows so it never overlaps the status bar
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
