package vOS.controller;

import java.net.MalformedURLException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import vOS.controller.R;
import vOS.controller.socket.IOAcknowledge;
import vOS.controller.socket.IOCallback;
import vOS.controller.socket.SocketIO;
import vOS.controller.socket.SocketIOException;
import android.app.ActionBar;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences.Editor;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.view.MenuItemCompat;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class PairCode extends Activity {
	
	private View connect;
	private EditText code;
	static SocketIO socket;
	private Activity that;
	private boolean dontDisconnect = false;
	public static ControlPanel ctrlReference;
	
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
	    MenuInflater inflater = getMenuInflater();
	    inflater.inflate(R.menu.action, menu);
	    return super.onCreateOptionsMenu(menu);
	}
	
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle item selection
	    switch (item.getItemId()) {
		    case R.id.signout:
			    Editor edit = PreferenceManager.getDefaultSharedPreferences(getApplicationContext()).edit();
				edit.remove("token");
				edit.remove("name");
				edit.apply();
	
				SignIn.userName = "";
				SignIn.token = "";
				SignIn.user = null;
	
				Intent intent = new Intent(getApplicationContext(), SignIn.class);
				intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
				startActivity(intent);
				return true;
		    default:
		    	return super.onOptionsItemSelected(item);
	    }
	}
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		that = this;
		setContentView(R.layout.code);
		ActionBar actionBar = getActionBar();
		actionBar.show();
		if (SignIn.userName != "") {
			actionBar.setTitle(" Welcome, " + SignIn.userName);
		}
		
		connect = findViewById(R.id.connect);
		code = (EditText)findViewById(R.id.code);
		refreshSocket();
	}
	
	@Override
	protected void onPause() {
		if (!dontDisconnect) {
			if (PairCode.socket != null)
				PairCode.socket.disconnect();
			System.out.println("pausing");
		}
		super.onPause();
	}	

	public void refreshSocket() {
		try {
			PairCode.socket = new SocketIO("http://vos.jit.su/");
			PairCode.socket.connect(new IOCallback() {
		        @Override
		        public void on(String event, IOAcknowledge ack, Object... args) {
					if (event.equals("response") && args.length > 0) {
		        		if (args[0].equals("correct pair code")) {
		        			start();
		        			toast("Connecting");
		        		} else if (args[0].equals("ready")) {
		        			toast("Connected");
		        		}
		        	}
		        	if (event.equals("error")) {
		        		if (args.length > 0 && args[0].equals("incorrect pair code")) {
		        			toast("Incorrect Code");
		        		}
	        			end();
		        	}
		        	if (event.equals("visual")) { 
		        		final String dataURI = args[0].toString().substring(22);
		        		
						if (ctrlReference != null) {
							runOnUiThread(new Runnable() {
							     @Override
							     public void run() {
							    	 ctrlReference.updatePanel(dataURI); 
							    }
							});							
						}
		        	}
		        }
				@Override
				public void onDisconnect() {
					System.out.println("Disconnected S.IO");
					end();
				}
				@Override 
				public void onConnect() {
					System.out.println("Connected S.IO");
				}
				@Override
				public void onMessage(String data, IOAcknowledge ack) {
				}
				@Override
				public void onMessage(JSONObject json, IOAcknowledge ack) {
				}
				@Override
				public void onError(SocketIOException socketIOException) {
					System.out.println(socketIOException);
					System.out.println("Error");
					end();
				}
		    });
			
			if (SignIn.token != "") {
				JSONObject data = new JSONObject();
				try {
					data.put("type", "input");
					data.put("token", SignIn.token);
				} catch (JSONException e) {}
				PairCode.socket.emit("declare-type", data);
			}
		} catch (MalformedURLException e) {
			System.out.println("EXCEPTION");
		}
	}
	
	public void end() {
		if (ControlPanel.that != null) {
			ControlPanel.that.finish();
			dontDisconnect = false; 
//			toast("Connection Ended");
		}
	}
	
	public void start() {
		dontDisconnect = true;
		Intent intent = new Intent(this, ControlPanel.class);
		startActivity(intent);
	}
	
	public void toast(final String message) {
		PairCode.this.runOnUiThread(new Runnable() {
		  public void run() {
		    Toast.makeText(PairCode.this, message, Toast.LENGTH_SHORT).show();
		  }
		});
	}
	
	public void connect(View view) {
		//PairCode.socket.emit("ping", code.getText().toString());
		//check if server is alive, if not, refreshSocket(); Need a time limit to waiting...
		
	    PairCode.socket.emit("code", code.getText().toString());
	    System.out.println("code: " + code.getText().toString());
		code.setText("");
	}
}
