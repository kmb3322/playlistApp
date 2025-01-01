**실행 전, firebase 연결을 위해 firebaseConfig.ts 파일을 루트 디렉토리에 생성하세요.**

# Outline

---

기본적인 플레이리스트 기능과, 사용자의 선호 음악 정보를 수집할 수 있는 월드컵 기능을 결합시킨 앱입니다.

사용자의 선호도에 따라 음악 앨범 커버 이미지를 보여줍니다.

# Team

---

**이정규**

- 한양대학교 컴퓨터소프트웨어학부 21
- https://github.com/ljg02

**김민범**

- 카이스트 전산학부 23
- https://github.com/kmb3322

# Tech Stack

---

**Front-end** : React-Native

**Back-end** : Firestore Database

**IDE** : Android Studio

# Details

---

### 스플래시

- 앱을 처음 실행하면 앱의 로고가 포함된 스플래시 화면이 표시됩니다.

### 메인 화면

- `navigator`를 이용하여 하단 바를 커스텀 제작하였습니다.
- 아이콘을 터치하면 탭 간 전환이 가능합니다.
- 탭 전환 시 애니메이션 효과를 추가하여 부드러운 탭 간 전환을 경험하도록 했습니다.

### Tab1: 플레이리스트
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img width="250" alt="Screenshot 2025-01-01 at 17 51 46" src="https://github.com/user-attachments/assets/9b93ca2b-05ab-418d-a0ac-ff000a86c117" />
  <img width="250" alt="Screenshot 2025-01-01 at 17 53 51" src="https://github.com/user-attachments/assets/0fcdbd1a-d308-47b5-8f27-f3eeae065bab" />
  <img width="250" alt="Screenshot 2025-01-01 at 17 54 18" src="https://github.com/user-attachments/assets/0c698ff4-a2a8-4dfc-8463-32035bf4b0bf" />
</div>

- firebase DB에서 `getDocs`로 음악 목록을 불러와 리스트로 보여줍니다.
- `Linking.openURL`을 사용하여 각 음악들을 터치하면 해당 음악의 유튜브 링크가 재생됩니다.
- `Swipeable`을 이용하여, 각 음악들을 스와이프하면 삭제 버튼이 나타나도록 구현했습니다.
- 상단 검색창에 제목 또는 가수 이름을 입력하여 음악을 검색할 수 있습니다.
- 셔플 버튼을 터치하면 플레이리스트의 음악들이 랜덤으로 정렬됩니다.
- 추가 버튼을 터치하면 제목, 가수, youtube ID를 입력하는 `Modal`이 나타나고, 정보를 입력하면 플레이리스트에 음악이 추가됩니다.

### Tab2: 월드컵
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img width="250" alt="Screenshot 2025-01-01 at 17 52 17" src="https://github.com/user-attachments/assets/76c3f288-9017-4d25-8f7e-f67cae6af303" />
  <img width="250" alt="Screenshot 2025-01-01 at 17 52 40" src="https://github.com/user-attachments/assets/8548029a-4b65-4a88-b969-12dafcc6af30" />
  <img width="250" alt="Screenshot 2025-01-01 at 17 53 04" src="https://github.com/user-attachments/assets/37bfd0e8-ffc2-4830-bcba-f0eea0aa8ae5" />
  <img width="250" alt="Screenshot 2025-01-01 at 17 53 29" src="https://github.com/user-attachments/assets/3bdeb84c-c52f-412f-90e9-9d1c5f1d893e" />
</div>

- 월드컵 화면에 처음 들어가면 플레이리스트를 선택하는 버튼들이 나타납니다.
- 선택한 플레이리스트의 음악들로 월드컵을 진행하게 됩니다.
- `PanGestureHandler`를 이용하여, 카드를 드래그하면 YES/NO를 선택할 수 있습니다.
- 플레이리스트의 모든 음악에 대해 YES/NO를 선택하고 나면, 내가 YES를 선택한 음악들의 리스트가 나타납니다.
- 여기서 YES를 선택한 음악들을 count하여 Tab3의 이미지 노출 순서에 반영합니다.
- 월드컵 다시 시작하기 버튼을 통해 현재 플레이리스트에서 월드컵을 다시 진행할 수 있고,
  다른 플레이리스트 살펴보기 버튼을 통해 플레이리스트 선택 화면으로 돌아갈 수 있습니다.

### Tab3: 탑스터
<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img width="250" alt="Screenshot 2025-01-01 at 17 54 41" src="https://github.com/user-attachments/assets/f4c96ece-6a81-4e01-adfc-9b96508544a0" />
  <img width="250" alt="Screenshot 2025-01-01 at 17 55 26" src="https://github.com/user-attachments/assets/e3591309-2508-4c48-ac64-443947786315" />
  <img width="250" alt="Screenshot 2025-01-01 at 17 55 42" src="https://github.com/user-attachments/assets/f96ab0eb-3d8a-4eab-b161-6aee499ab0c1" />
</div>

- 월드컵에서 가장 많이 선택한 음악 순서대로 앨범 커버 이미지가 정렬되어 나타납니다.
- 이미지 로딩에 부드러운 느낌을 주기 위해, `fade`애니메이션을 적용하여 상위 이미지부터 서서히 노출되도록 구현하였습니다.
- 일정 횟수 이상 선택된 음악은 이미지 크기가 커집니다.

**playlistWorldcup은, React-Native로 제작되었습니다. 구동 방법은 다음과 같습니다.**

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:
