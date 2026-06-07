# 02 — 유저 스토리 (User Stories)

> Inception 산출물 #2. [01-requirements](01-requirements.template.md)의 목표/기능 요구사항을 사용자 관점의 스토리로 풀고, 각 스토리에 **수용 기준(Given/When/Then)** 을 붙인다.
> 작성: **app-pm** 리드 mob, code-review 리뷰. 스토리는 [03-units-of-work](03-units-of-work.template.md)로 묶여 구현 단위가 된다.
> `<...>`는 자리표시자, `TODO`는 채울 항목.

작성일: `<YYYY-MM-DD>` · 상태: `<⬜ Pending | 🔵 In Progress | ⏸️ Awaiting Approval | ✅ Approved | 🔁 Changes Requested>`

---

## 형식

각 스토리는 다음 형식을 따른다.

- **사용자 가치**: `<역할>`로서 `<무엇>`을 하고 싶다, 그래서 `<왜/이득>`.
- **수용 기준**: `Given <전제>, When <행동>, Then <기대 결과>` (필요한 만큼 여러 줄).

우선순위: P0(필수) · P1(중요) · P2(추후). 연관 요구사항 FR-ID와 후보 Unit ID를 함께 적는다.

---

## US-01 `<짧은 제목, 예: 단어 스와이프 분류>`

- 우선순위: `<P0 | P1 | P2>` · 연관 요구사항: `<FR-01, ...>` · 후보 Unit: `<UoW-03-learn-deck>`
- **학습자**로서 `<카드를 좌/우로 스와이프해 "학습할게요/알고 있어요"로 분류>`하고 싶다, 그래서 `<빠르게 아는 것/모르는 것을 가른다>`.

수용 기준:
- Given `<레벨 덱이 로드된 학습 화면>`, When `<카드를 오른쪽으로 스와이프>`, Then `<"알고 있어요"로 분류되고 다음 카드가 나타난다>`.
- Given `<방금 분류한 직후>`, When `<undo를 누른다>`, Then `<직전 분류가 취소되고 카드가 복원된다>`.
- TODO: `<기준 추가>`

## US-02 `<제목, 예: 발음 듣기>`

- 우선순위: `<...>` · 연관 요구사항: `<FR-02>` · 후보 Unit: `<UoW-04-tts>`
- `<역할>`로서 `<무엇>`을 하고 싶다, 그래서 `<왜>`.

수용 기준:
- Given `<...>`, When `<...>`, Then `<...>`.
- TODO: `<기준 추가>`

## US-03 `<제목>`

- 우선순위: `<...>` · 연관 요구사항: `<...>` · 후보 Unit: `<...>`
- `<역할>`로서 `<무엇>`을 하고 싶다, 그래서 `<왜>`.

수용 기준:
- Given `<...>`, When `<...>`, Then `<...>`.

---

## TODO: 스토리 추가

위 블록을 복제해 US-04, US-05 ... 를 채운다. DESIGN.md §2~§6, ROADMAP.md M0~M12를 훑어 누락된 사용자 가치가 없는지 확인한다.

> 다음 산출물: [03-units-of-work.template.md](03-units-of-work.template.md). 이 문서는 Inception 종료 체크포인트에서 승인 대상이다. [README.md](README.md) 참고.
