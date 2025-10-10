import { createAgoraRtcEngine, IRtcEngineEx, ChannelProfileType, ClientRoleType } from 'react-native-agora';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export class AgoraConfig {
  private static appId = Constants.expoConfig?.extra?.agoraAppId || '04d490cc39a8474e96901735ec2e362e'; 

  static async initializeAgora(): Promise<IRtcEngineEx> {
    if (Platform.OS === 'ios') {
      const { status: cameraStatus } = await Permissions.askAsync(Permissions.CAMERA);
      const { status: audioStatus } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (cameraStatus !== 'granted' || audioStatus !== 'granted') {
        throw new Error('Camera or microphone permission not granted');
      }
    }

    const engine = createAgoraRtcEngine() as IRtcEngineEx;
    engine.initialize({ appId: this.appId });
    await engine.enableVideo();
    await engine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
    await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    return engine;
  }
}