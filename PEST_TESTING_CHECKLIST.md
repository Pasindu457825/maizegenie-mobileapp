# Pest Functionality Testing Checklist

This project does not use Laravel `PestPHP`. The pest-related feature here is the **Pest Identification & Control System** built with:

- `client/`: React Native (Expo)
- `server/`: FastAPI (Python)

Use this checklist for final-stage QA of the pest module.

## 1. Scope to Test

Main pest flows found in the codebase:

- Pest image upload and AI detection
- Premium/local model switching
- Pest frequency analytics
- Lifecycle and control page navigation
- Pest forum submission and officer/admin reply flow
- Error handling and subscription gating

Relevant files:

- `server/src/pestidentify/router.py`
- `server/src/pestidentify/service.py`
- `server/src/pestidentify/premium_service.py`
- `server/src/pestidentify/frequency_service.py`
- `client/src/screens/PestIdentification/PestIdentifyLoadingScreen.tsx`
- `client/src/screens/PestIdentification/PestFrequencyAnalysisScreen.tsx`
- `client/src/screens/PestIdentification/PestFeedbackScreen.tsx`
- `client/src/screens/PestIdentification/OfficerFeedbackScreen.tsx`
- `client/src/screens/PestIdentification/AdminPestForum.tsx`

## 2. Pre-Test Setup

## Backend

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Verify:

- `http://localhost:8000/health` returns `{"status":"ok"}`

## Frontend

```bash
cd client
npm install
npx expo start
```

Test on:

- 1 Android device or emulator
- 1 web build if your team supports web

## Test Accounts

Prepare at least these users:

- Farmer without subscription
- Farmer with active subscription
- Officer account
- Admin account

## Test Images

Prepare image samples for:

- Fall Armyworm
- Bollworm
- Asian Corn Borer
- Non-pest image
- Blurry image
- Empty/invalid upload if possible

## 3. Core Manual Test Cases

## A. Pest detection happy path

1. Open Pest Identification.
2. Select image from camera.
3. Select image from gallery.
4. Press `Identify Pest`.

Expected:

- Loading spinner appears
- Request is sent to `/api/pest/identify`
- Pest name and confidence appear
- No crash
- Relevant lifecycle/control buttons appear for detected pest

Run this for:

- Fall Armyworm
- Bollworm
- Asian Corn Borer

## B. No-pest scenario

Use a clean non-pest image.

Expected:

- User sees `No pests detected`
- Tips for better image quality are shown
- App does not freeze or navigate incorrectly

## C. Invalid image quality

Use dark, blurry, far-away images.

Expected:

- Either no detection or low-confidence safe behavior
- App shows graceful result/error state
- No broken UI

## D. Premium model access control

From the app context, switch `pestModel` to premium and test:

### User without active subscription

Expected:

- Backend returns `403`
- App shows subscription-related message
- User is redirected to `SubscriptionPlans`

### User with active subscription

Expected:

- Detection succeeds
- No subscription error

## E. Empty or bad upload

Try to trigger:

- no image selected
- invalid image file
- interrupted upload/network issue

Expected:

- No unhandled exception
- Friendly error shown
- Retry path works

## F. Pest frequency analytics

After running several detections, verify:

- `/api/pest/frequency?days=30&top_n=3`
- frequency card updates on Pest Identification screen
- full analysis screen opens

Expected:

- `total_requests` increases
- `top_pests` reflects recent detections
- `no_pest_requests` increases after non-pest tests
- officer/admin can request broader analytics as allowed

## G. Lifecycle and control navigation

For each pest type:

- Fall Armyworm
- Bollworm
- Asian Corn Borer

Expected:

- Correct lifecycle screen opens
- Correct control screen opens
- Content matches detected pest
- Back navigation works

## H. Language support

Test in:

- English
- Sinhala
- Tamil

Expected:

- Labels render correctly
- Error text changes with language
- No layout break or missing translation in pest flow

## I. Pest forum flow

As farmer:

1. Open Pest Forum
2. Submit pest issue
3. Optionally attach image

Expected:

- Record saves successfully
- Entry appears in farmer history

As officer/admin:

1. Open pending feedback
2. Reply
3. Change status if supported

Expected:

- Reply is stored
- Farmer can see officer reply
- No duplicate or missing records

## 4. Backend API Test Cases

Use Postman or curl.

## Identify endpoint

Endpoint:

```http
POST /api/pest/identify?conf=0.4&return_image=false&model=local
```

Checks:

- valid JPEG works
- empty body returns `400`
- unauthenticated request is blocked if auth dependency requires token
- premium model without subscription returns `403`
- premium model with missing Roboflow env returns `503` or error message

## Frequency endpoint

Endpoint:

```http
GET /api/pest/frequency?days=30&top_n=5
```

Checks:

- valid authenticated farmer gets own stats
- officer/admin role can query with `farmer_id`
- invalid `days` or `top_n` is rejected by FastAPI validation

## 5. Regression Checks

Before sign-off, verify these do not break:

- login and token storage
- subscription screens
- image picker permissions
- navigation stack
- Supabase writes for pest feedback and replies
- frequency logging fallback to file when Supabase is unavailable

## 6. Final UAT Sign-Off Matrix

Mark each item as `Pass` or `Fail`:

- Farmer can identify all supported pests
- Non-pest images are handled safely
- Premium gating works correctly
- Frequency analytics are updated after detections
- Lifecycle/control pages match detected pest
- Farmer can submit pest issue
- Officer/admin can reply
- English/Sinhala/Tamil UI works
- No crash on slow network
- No crash on denied camera/gallery permission

## 7. Recommended Final-Stage Test Strategy

For this repo, the best final-stage approach is:

1. Do **manual end-to-end testing** for the full pest journey in the mobile app.
2. Do **API verification in Postman** for `/api/pest/identify` and `/api/pest/frequency`.
3. Add a few **automated backend smoke tests** later for:
   - empty upload
   - premium access denied
   - frequency stats response shape
   - no-pest result shape

## 8. Important Note

There is currently **no clear working automated test framework configured** for this pest module in the repo. For the final submission stage, manual QA plus API smoke testing is the safest immediate approach.
