# راهنمای آماده‌سازی انتشار Taskzidio

این راهنما مربوط به آماده‌سازی `S10-03` است. میزبان و آدرس نهایی هنوز انتخاب نشده‌اند؛ مقادیر `https://example.com` و `YOUR_PROJECT_REF` فقط نمونه‌اند. استقرار و بررسی عملی `S10-04` پس از تعیین مقصد انجام می‌شود.

## پیش‌نیازها و تنظیمات برنامه

- یک میزبان با پشتیبانی از اجرای Nuxt به‌صورت SSR و یک آدرس نهایی HTTPS انتخاب کنید. مسیر `/reset-password` در [تنظیمات Nuxt](../nuxt.config.ts) فقط در مرورگر رندر می‌شود.
- یک پروژه Supabase برای محیط مقصد و کلید **publishable** همان پروژه داشته باشید. این پروژه باید با پروژه‌ای که migration روی آن اعمال می‌شود یکی باشد.
- دو مقدار زیر را در تنظیمات محیط میزبان قرار دهید. نمونهٔ بدون کلید واقعی در [`.env.example`](../.env.example) است:

  | متغیر | مقدار |
  | --- | --- |
  | `NUXT_PUBLIC_SUPABASE_URL` | آدرس API پروژه، مانند `https://YOUR_PROJECT_REF.supabase.co` |
  | `NUXT_PUBLIC_SUPABASE_KEY` | کلید publishable با پیشوند `sb_publishable_` از همان پروژه |

متغیرهای `NUXT_PUBLIC_` به مرورگر می‌رسند. کلید `service_role`، کلید secret، رمز دیتابیس و توکن مدیریت Supabase را در این متغیرها، فایل‌های client یا مخزن قرار ندهید. فایل‌های `.env` در [`.gitignore`](../.gitignore) نادیده گرفته می‌شوند؛ مقادیر واقعی را فقط در محیط مقصد نگه دارید.

## تنظیم URLهای Supabase Auth

در Supabase Dashboard پروژهٔ مقصد، بخش **Authentication → URL Configuration** را باز کنید:

1. **Site URL** را برابر مبدأ نهایی برنامه بگذارید؛ برای مثال `https://example.com`، بدون مسیر.
2. این آدرس‌ها را در **Redirect URLs** مجاز کنید و به جای دامنهٔ نمونه، دامنهٔ واقعی را بنویسید:

   - `https://example.com/confirm`
   - `https://example.com/reset-password?recovery=1`

   در تنظیمات فعلی کتابخانه، پارامتر اختیاری `sb_flow_id` به redirect افزوده نمی‌شود. اگر بعداً گزینهٔ `appendPkceFlowIdToRedirects` فعال شد، دو الگوی محدود `https://example.com/confirm?sb_flow_id=*` و `https://example.com/reset-password?recovery=1&sb_flow_id=*` را نیز اضافه کنید. اگر برای محیط پیش‌نمایش یا توسعه هم ایمیل ارسال می‌کنید، معادل URLهای لازم را با مبدأ همان محیط جداگانه مجاز کنید. از الگوی باز برای تمام دامنه‌ها در تولید استفاده نکنید.
3. **Confirm Email** را مطابق تصمیم محصول فعال نگه دارید. قالب ایمیل‌های تأیید و بازیابی را بررسی کنید تا لینک آن‌ها از redirect درخواستی استفاده کند؛ در کد، مقصد تأیید در [ثبت‌نام](../app/pages/signup.vue) و مقصد بازیابی در [درخواست بازیابی](../app/pages/forgot-password.vue) از `window.location.origin` ساخته می‌شود. به همین دلیل دامنه‌ای که کاربر با آن برنامه را باز می‌کند باید در فهرست مجاز باشد.

اگر لینک به Site URL برمی‌گردد یا به مسیر درست نمی‌رسد، ابتدا تطابق Redirect URLs و قالب ایمیل را بررسی کنید. [راهنمای رسمی Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) جزئیات الگوها و تنظیم قالب ایمیل را توضیح می‌دهد.

## اعمال migration در پروژهٔ مقصد

فایل [migration وظایف](../supabase/migrations/20261106000000_create_tasks.sql) جدول `public.tasks`، قیود، دسترسی‌های ستونی و سیاست‌های RLS را ایجاد می‌کند. آن را پیش از استفاده از برنامه روی **همان پروژه Supabase مقصد** اعمال کنید. برای یک پروژهٔ تازه، روش CLI به این ترتیب است؛ این دستورها در تهیهٔ این راهنما اجرا نشده‌اند:

```sh
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list --remote
supabase db push --dry-run --remote
supabase db push --remote
supabase migration list --remote
```

پیش از `db push`، خروجی `migration list` و `dry-run` را با پروژه و فایل مورد انتظار تطبیق دهید. `db push --remote` روی پایگاه دادهٔ میزبانی‌شده تغییر ایجاد می‌کند. در CLI نسخهٔ ۳، بدون `--remote` مقصد پیش‌فرض محلی است؛ گزینه‌های همان نسخه را با `supabase --help` و `supabase db push --help` بررسی کنید. اگر پروژهٔ مقصد از قبل جدول یا migration مشابه دارد، ابتدا تاریخچه و schema را تطبیق دهید و migration ایجاد جدول را کورکورانه دوباره اجرا نکنید. [راهنمای رسمی migration](https://supabase.com/docs/guides/deployment/database-migrations) روش بررسی اختلاف تاریخچه را شرح می‌دهد.

بعد از اعمال، در تنظیمات **Data API** پروژه بررسی کنید که API فعال و جدول `public.tasks` برای نقش `authenticated` قابل دسترس باشد. migration دسترسی‌های لازم را به همین نقش می‌دهد و RLS خواندن و نوشتن را به مالک محدود می‌کند. کلید publishable دسترسی مدیریتی نمی‌دهد. [راهنمای امنیت Data API](https://supabase.com/docs/guides/api/securing-your-api) تفاوت دسترسی جدول و RLS را توضیح می‌دهد.

## مواردی که پس از تعیین میزبان باید تأیید شوند

- URL و کلید publishable تنظیم‌شده به همان پروژه‌ای اشاره کنند که migration روی آن اعمال شده است.
- Site URL و Redirect URLs با دامنهٔ نهایی و آدرس‌های ساخته‌شده در برنامه یکسان باشند.
- ثبت‌نام/تأیید ایمیل، ورود، بازیابی رمز، خروج و CRUD با دو حساب مستقل در محیط منتشرشده بررسی شوند؛ دسترسی بین‌حسابی باید توسط RLS رد شود.
- نتیجهٔ بررسی موبایل، تبلت و دسکتاپ و معیارهای پذیرش [PRD](./PRD.md) ثبت شود.

این بررسی‌های عملی و انتشار، جزء `S10-04` هستند و در این مرحله انجام نشده‌اند.
