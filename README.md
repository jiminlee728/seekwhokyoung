# 식후경 P0 모바일 웹 데모

이 저장소는 식후경 MVP의 P0 차수별 정산 웹 데모와 정산/일정 도메인 로직을 포함합니다.

## 로컬 실행 링크

Codex 작업 환경의 `/workspace/seekwhokyoung` 경로는 개발 에이전트 내부 경로입니다. 로컬 Mac/PC에서는 해당 경로로 이동하지 말고, 저장소를 내려받은 실제 폴더에서 실행하세요.

가장 안전한 실행 방법은 **먼저 현재 폴더가 식후경 저장소인지 확인한 뒤** 실행하는 것입니다.

```bash
pwd
ls package.json public scripts src test tsconfig.json
npm start
```

예를 들어 터미널 프롬프트가 이미 `seekwhokyoung %`처럼 저장소 폴더를 가리키고 있다면 `cd ~/Downloads/seekwhokyoung-master`를 실행하지 말고 바로 `npm start`를 실행하세요.
예시:

```bash
cd ~/Downloads/seekwhokyoung-master
npm start
```

또는 이미 `seekwhokyoung-master` 폴더 안에 있다면:

```bash
npm start
```

만약 저장소 위치를 모르겠다면 Mac에서 아래 명령으로 실제 폴더를 찾을 수 있습니다.

```bash
find ~ -name package.json -path '*seekwhokyoung*' -maxdepth 6 2>/dev/null
```

찾은 경로가 예를 들어 `/Users/ijimin/Desktop/seekwhokyoung/package.json`라면 아래처럼 이동합니다.

```bash
cd /Users/ijimin/Desktop/seekwhokyoung
npm start
```

서버가 정상 실행되면 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```




## `cd: no such file or directory`와 `EJSONPARSE`가 같이 뜰 때

아래처럼 출력되면 두 가지 일이 연속으로 발생한 것입니다.

```text
cd: no such file or directory: /Users/ijimin/Downloads/seekwhokyoung-master
npm ERR! code EJSONPARSE
```

1. `/Users/ijimin/Downloads/seekwhokyoung-master` 폴더가 실제로 없습니다.
2. `cd`가 실패했기 때문에, 바로 다음 줄의 `npm start`는 **원래 있던 현재 폴더**에서 실행되었습니다. 그 현재 폴더의 `package.json`이 깨져 있어서 `EJSONPARSE`가 난 것입니다.

해결 순서:

```bash
# 1) 지금 내가 어디 있는지 확인
pwd

# 2) 현재 폴더가 식후경 저장소인지 확인
ls package.json public scripts src test tsconfig.json

# 3) 위 ls가 모두 보이면 package.json 복구
bash scripts/repair-package-json.sh

# 4) 실행
npm start
```

만약 2번에서 파일이 없다고 나오면 현재 폴더가 식후경 저장소가 아닙니다. 이때는 실제 위치를 먼저 찾으세요.

```bash
find ~ -name package.json -path '*seekwhokyoung*' -maxdepth 6 2>/dev/null
```

## 디렉터리 목록만 보일 때

브라우저 주소가 `127.0.0.1:5500`이고 `docs`, `public`, `src` 폴더 목록만 보이면, 식후경 서버가 아니라 VS Code Live Server 같은 정적 파일 서버로 저장소 루트를 열고 있는 상태입니다. 이제 저장소 루트에도 `index.html`을 추가했으므로 새로고침하면 `public/index.html`로 이동합니다.

정산 계산까지 정상 동작시키려면 반드시 아래처럼 Node 서버를 실행하고 `3000`번 포트로 접속하세요. Live Server의 `5500`번 포트는 정적 파일만 보여주기 때문에 `/api/settlement/calculate`가 동작하지 않습니다.

```bash
# 이미 seekwhokyoung 폴더 안이라면 cd 없이 실행
npm start

# 폴더 위치를 모르면 먼저 찾기
find ~ -name package.json -path '*seekwhokyoung*' -maxdepth 6 2>/dev/null
```

접속 주소:

```text
http://localhost:3000
```

정적 UI만 확인하려면 아래 주소도 가능합니다. 단, 이 경우 정산 API는 동작하지 않을 수 있습니다.

```text
http://127.0.0.1:5500/public/index.html
```

## package.json 오류 즉시 복구

`npm ERR! JSON.parse Invalid package.json`가 발생하면 현재 로컬의 `package.json`이 깨진 상태입니다. 이때는 `npm start`가 실행되기 전에 npm이 중단되므로, npm 명령이 아니라 아래 복구 스크립트를 먼저 실행하세요.

```bash
# 먼저 식후경 저장소 루트로 이동했는지 확인
pwd
ls package.json public scripts src test tsconfig.json

# package.json 복구 후 실행
cd ~/Downloads/seekwhokyoung-master
bash scripts/repair-package-json.sh
npm start
```

복구 후 접속 주소는 동일합니다.

```text
http://localhost:3000
```


## `tsc: command not found`가 뜰 때

이제 `npm start`는 TypeScript 컴파일러 없이 실행되도록 수정되어 있습니다. 즉, 로컬 데모 실행에는 `tsc` 설치가 필요 없습니다.

```bash
# package.json을 최신 실행 스크립트로 복구
bash scripts/repair-package-json.sh

# 빌드 없이 서버 실행
npm start
```

`npm test`는 TypeScript 테스트용 명령이라서 로컬에 `tsc`가 없으면 실패할 수 있습니다. 데모 확인만 하려면 `npm start`만 사용하세요.

## 실행 전 확인

`package.json`은 반드시 유효한 JSON이어야 합니다. 현재 저장소의 정상 `package.json`은 아래 형태입니다.

```json
{
  "name": "seekwhokyoung",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "npm run build && node --test \"dist/**/*.test.js\"",
    "start": "node scripts/server.mjs",
    "start": "npm run build && node scripts/server.mjs",
    "serve": "node scripts/server.mjs"
  },
  "devDependencies": {}
}
```

만약 `npm ERR! JSON.parse Invalid package.json`가 발생하면 다음을 확인하세요.

1. 현재 위치가 이 저장소 루트인지 확인합니다.

   ```bash
   pwd
   ls package.json public scripts src test tsconfig.json
   ```

2. `package.json` 문법을 검사합니다.

   ```bash
   node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"
   ```

3. 에러가 계속되면 `package.json`을 위 정상 예시와 동일하게 되돌린 뒤 다시 실행합니다.

## 자주 쓰는 명령

```bash
npm test
npm start
```

- `npm test`: TypeScript 빌드와 자동 테스트를 실행합니다.
- `npm start`: 별도 빌드 없이 로컬 웹 서버를 실행합니다.

## 현재 구현 범위

- 모바일 웹 UI: 참석자, 차수, 참석 체크, 금액, 복수 결제 내역, 결제자, 할인 입력.
- 고급 부담 옵션: 참석자별 반만 부담, 0.25 부담, 수동 조정 금액, 술값 제외.
- 일정 조율 UI: 후보 시간/장소, 참석자별 가능·애매·불가능, 선호도, 추천 Top 3, 시간 확정.
- 저장 기능: 브라우저 `localStorage` 자동 저장과 서버 메모리 기반 저장 링크 생성.
- 정산 API: `/api/settlement/calculate`.
- 저장 API: `POST /api/events`, `GET /api/events/:eventId`.
- `npm start`: TypeScript 빌드 후 로컬 웹 서버를 실행합니다.

## 현재 구현 범위

- 모바일 웹 UI: 참석자, 차수, 참석 체크, 금액, 결제자, 할인 입력.
- 정산 API: `/api/settlement/calculate`.
- 정산 결과: 최소 송금표, 개인별 balance/부담액, 카카오톡 공유 문구.
- 로컬 실행 URL: `http://localhost:3000`.
