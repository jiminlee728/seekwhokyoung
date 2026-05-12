# 식후경 P0 모바일 웹 데모

이 저장소는 식후경 MVP의 P0 차수별 정산 웹 데모와 정산/일정 도메인 로직을 포함합니다.

## 로컬 실행 링크

Codex 작업 환경의 `/workspace/seekwhokyoung` 경로는 개발 에이전트 내부 경로입니다. 로컬 Mac/PC에서는 해당 경로로 이동하지 말고, 저장소를 내려받은 실제 폴더에서 실행하세요.

예시:

```bash
cd ~/Downloads/seekwhokyoung-master
npm start
```

또는 이미 `seekwhokyoung-master` 폴더 안에 있다면:

```bash
npm start
```

서버가 정상 실행되면 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```


## package.json 오류 즉시 복구

`npm ERR! JSON.parse Invalid package.json`가 발생하면 현재 로컬의 `package.json`이 깨진 상태입니다. 이때는 `npm start`가 실행되기 전에 npm이 중단되므로, npm 명령이 아니라 아래 복구 스크립트를 먼저 실행하세요.

```bash
cd ~/Downloads/seekwhokyoung-master
bash scripts/repair-package-json.sh
npm start
```

복구 후 접속 주소는 동일합니다.

```text
http://localhost:3000
```

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
- `npm start`: TypeScript 빌드 후 로컬 웹 서버를 실행합니다.

## 현재 구현 범위

- 모바일 웹 UI: 참석자, 차수, 참석 체크, 금액, 결제자, 할인 입력.
- 정산 API: `/api/settlement/calculate`.
- 정산 결과: 최소 송금표, 개인별 balance/부담액, 카카오톡 공유 문구.
- 로컬 실행 URL: `http://localhost:3000`.
