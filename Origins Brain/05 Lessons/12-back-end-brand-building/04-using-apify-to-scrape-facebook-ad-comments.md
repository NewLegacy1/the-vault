# Using Apify to Scrape Facebook Ad Comments

Source: Origins Program  
Classroom: https://www.skool.com/origins/classroom/03b8079b?md=bd2d539c2e1148c08dd5f577f73fb2d6  
Duration: 8:41  
Method: English CC + on-page notes

## Slide / lesson notes

Extract hidden insights from Facebook post and ad comments using Apify! Learn how to mine customer feedback to uncover exact pain points, customer desires, sub-avatars, and compelling headlines for your marketing campaigns.

### 💡 Key Takeaways & Highlights:

🛠️ Introduction to Apify "Actors": Overview of Apify tools (like the Facebook Comments Scraper) used for web scraping and bulk data extraction.
- 
🔗 Post URL Requirement: Why the scraper requires a direct Facebook post/ad URL rather than an Ad Library link—and how to get targeted competitor ads served in your organic feed by interacting with their brand.
- 
📊 Running a Extraction Task: How to input a post URL, configure settings (e.g., set result limits and include comment replies), and execute a scraping task.
- 
📥 Exporting & Cleaning Data: Exporting raw scraped data into CSV/Excel format and filtering out irrelevant columns to isolate exact comment text.
- 
🎯 Uncovering Golden Marketing Nuggets: How real customer quotes reveal visceral pain points (e.g., "dry winter lips", "no more peeling"), providing perfect verbatim copy for ad headlines, creative angles, and buyer avatars.

Key Takeaway from Mike - use manual research here to check comments because AI often misses some golden nuggets.
-

## Transcript (English CC)

[00:00:00.000] Alright, guys, this module is all about accessing data that you've probably not
[00:00:05.470] had before.
[00:00:06.080] Okay, so why this becomes useful is if you've got some ads yourself and they
[00:00:10.640] have some engagement
[00:00:11.520] on them, you want to be able to understand who these people are that you're
[00:00:16.220] targeting
[00:00:16.880] and why are they buying from you. And this works well because you might be
[00:00:21.580] targeting a certain
[00:00:22.560] individual on your ads in terms of your core avatar, your sub avatar, and the
[00:00:27.900] angle, but
[00:00:28.720] actually the people that are buying are completely different persona altogether
[00:00:32.560] in a different reason,
[00:00:33.760] and you can find these golden nuggets through your Facebook comments. So for me
[00:00:37.650] as an example,
[00:00:39.040] I have my brand and one of my ads has spent over £200,000 across two markets.
[00:00:45.810] So what that's
[00:00:46.160] giving me is a lot of comments and a lot of engagement I can now mine data for.
[00:00:51.120] So what we're
[00:00:53.280] going to do on this session, we're going to use a tool called Appify. Now, App
[00:00:58.080] ify, I believe,
[00:00:59.520] is a tool where people build things called actors. And within those actors, it
[00:01:05.250] can do certain actions
[00:01:06.480] and it can extract data from various different sources. So we'll see here if
[00:01:11.030] you go to console.appify.com/store.
[00:01:14.720] Now this is paid by the way, but it's pretty cheap. I signed up for $30 and I
[00:01:19.270] was able to scrape all
[00:01:20.480] of my top ads, which has got thousands and thousands of rows of data. All right
[00:01:25.400] , so you probably only
[00:01:26.160] need this once and then you can go away and do what you please with the data
[00:01:29.850] and sign up again
[00:01:30.640] if you want. But you'll see here, there's other things like TikTok comment scra
[00:01:34.130] per. We've also
[00:01:34.880] got a trust pilot scraper as well. So this is basically a data extraction tool
[00:01:40.000] and it goes ahead
[00:01:40.960] and does that. So the key one here is we're going to look at a Facebook comment
[00:01:48.140] scraper. Now we're
[00:01:49.760] going to search in here Facebook comment scraper.
[00:01:53.920] Okay, and the one we want is
[00:02:03.120] I need to sort this by popular. Okay, so this one here, Facebook comments scra
[00:02:12.350] per and it's the
[00:02:12.880] 38,000 users one. Okay, there's a lot of others. This is the one I've used and
[00:02:17.880] this one works
[00:02:18.960] well. Okay, so clicking to the Facebook comments scraper. Now the caveat here,
[00:02:24.480] guys, is you need
[00:02:26.320] the URL of the post of the post that you've got or a competitor. Now it doesn't
[00:02:32.540] work with the ads
[00:02:33.280] library. You'll see here, I've actually got an ads library linking house
[00:02:35.930] testing. Okay,
[00:02:37.120] what's important here is you grab the post URL and the way you get this is if
[00:02:43.360] you've got a certain
[00:02:44.080] competitor. So let's take groons as an example. You would start to interact
[00:02:48.130] with the brand,
[00:02:48.960] you'd like their posts, you'd maybe share them, whatever, so that you're in
[00:02:53.770] their funnel. Okay,
[00:02:54.640] then you're going to get served the rest of the rat their ads and you'll start
[00:02:58.110] to see a lot more
[00:02:58.960] of their content on your natural feed. Now, when you get that content, you will
[00:03:05.180] get a link similar
[00:03:06.880] to this. Okay, so this is the actual post ID. Now this example is honey balm UK
[00:03:12.640] and we can see here
[00:03:14.720] the 692 likes on this video. So I'm going to go ahead and I'm going to copy
[00:03:19.670] that URL and I'm going
[00:03:20.560] to paste this now into the Facebook URL on our Facebook comments scraper. Now,
[00:03:29.070] like I said,
[00:03:29.840] you will have to sign up to get some credits first to do this. You might even
[00:03:34.130] get a trial so you can
[00:03:35.440] actually try this out for yourself. I think you get a certain number of rows
[00:03:38.480] that you can actually
[00:03:39.200] extract. Well, let's go ahead and do this. And what I'm going to do here, I'm
[00:03:41.930] going to say I want
[00:03:42.880] to extract 20 rows just for the purpose of this. But what I have done is I've
[00:03:48.050] put them, you can
[00:03:49.360] have a route keep this a zero or you can say 10,000 rows, it really depends.
[00:03:53.120] Okay, so I'm going to say
[00:03:54.640] I want 20 results and that's 20 rows. Now, there are some settings here that I
[00:04:00.850] do add on as well,
[00:04:01.600] which is include comment replies. The reason why is because I want to see, you
[00:04:05.360] know, especially on
[00:04:06.640] my ads, have I commented, has my team commented has another customer commented
[00:04:11.680] from main customers
[00:04:13.200] query or comment. So I want to see everything. Okay, so I'm going to head and
[00:04:17.520] click that on and
[00:04:18.800] then I'm going to simply click save and start here. Now, whilst this is running
[00:04:22.880] going to pause,
[00:04:25.040] okay, and it's now come back with every row from the 10 I've selected. We can
[00:04:32.790] see it's also pulled
[00:04:33.520] through how many likes we've got on each one as well. Let's just have a scan of
[00:04:38.990] this game. So
[00:04:40.800] order six before Christmas, my lips feel great and the scent is amazing. Okay,
[00:04:46.720] so we've got some good
[00:04:47.600] words here, definitely ordering again. I suffer with really bad dry lips during
[00:04:51.980] the winter and
[00:04:52.800] products work for about a week and they don't. This is fantastic. My lips are
[00:04:57.140] soft, no more
[00:04:57.920] peeling and doesn't leave that nasty clumped up crack at corners in your mouth.
[00:05:02.450] I'm going to
[00:05:02.880] definitely water some more flavors. We can just see after 10 rows of data, it's
[00:05:07.020] now giving us some new
[00:05:08.160] angles is giving us some some some sub avatars potentially as well and some
[00:05:12.240] really kind of visceral
[00:05:13.680] words. My lips are soft, no more peeling, you know, their potential headlines
[00:05:18.030] on statics. So straight
[00:05:20.160] away, we've got some good information here. Now I'm going to scroll down and to
[00:05:25.510] the nothing else,
[00:05:25.840] now there's not. And what I'm going to do now is I am going to go to
[00:05:30.560] export at the top. Now you can switch between the two tabs. So we've got
[00:05:36.780] overview, we've got all
[00:05:38.400] fields. All fields will literally put everything that it can. I personally just
[00:05:43.470] go for the overview
[00:05:44.720] and it gives you the URL, gives you the comment and it gives you the post title
[00:05:48.190] . Although you don't
[00:05:48.720] really need the post title either. All right, so we're going to go ahead and we
[00:05:52.070] 're going to export
[00:05:52.960] this to CSV or Excel. Okay, so we've gone ahead and downloaded that. And we'll
[00:05:59.330] now we get the data
[00:06:00.480] set now, although on the overview, we're on out a few fields. There is a lot
[00:06:04.480] here that did pull
[00:06:05.360] through almost and mustn't have scanned across. But if we go across, so we can
[00:06:08.710] just start to clean
[00:06:09.600] this file up. Let's see where the actual comments are. So we get names as well.
[00:06:15.920] We can do some analysis
[00:06:17.120] on that as to AI saying, well, what's the percentage of men? What's the
[00:06:20.600] percentage of women names that
[00:06:21.920] are commenting? Okay, so it's column A X in this example. So I'm just going to
[00:06:41.530] clean the rest of
[00:06:42.240] this crap out so you can see. Okay, now what I actually like to do with this,
[00:06:47.170] and I've started
[00:06:47.680] to do this on a manual basis, I will have a novice document open. And what I'm
[00:06:54.020] going to be copying over
[00:06:56.160] is the actual comment. I want to copy the what I believe is the desire a.k.a.
[00:07:02.380] core avatar.
[00:07:03.680] And be if I can break it down enough, I'm going to be looking to break down
[00:07:07.890] into a sub avatar. So
[00:07:09.680] if we take this example of the lady with really bad dry lips, so what's her
[00:07:13.680] experience? She's had
[00:07:15.120] an experience of maybe Vaseline that doesn't actually work. Okay, and it gives
[00:07:21.060] nasty clumps of
[00:07:22.080] white crap around the side of your mouth when she uses all the solutions. So we
[00:07:26.420] 're getting a lot
[00:07:27.440] more information here that we can craft these sub avatars from. So not to
[00:07:31.800] forget, we've got emotions,
[00:07:33.920] we've got behaviors, and we've got experiences that make up these sub avatars.
[00:07:39.120] Okay, so I like
[00:07:40.240] to collect those in a separate sheet. And what I'll do is I will just highlight
[00:07:43.710] the row in green to
[00:07:45.040] signify that I've done something with it. And I will copy over the actual
[00:07:49.120] comment as well
[00:07:50.080] to my new desire research sheet. So guys, this is super simple, pretty cheap
[00:07:57.360] for the data that
[00:07:58.080] you get in back. And like I said earlier, it is great for looking at your own
[00:08:03.840] ads, but also your
[00:08:05.040] competitors as well. The only caveat is you will have to go inside the funnel
[00:08:09.970] of the competitor
[00:08:11.040] to be able to start to see the ads. Now, I haven't actually tried to check
[00:08:15.740] whether you can get the
[00:08:17.280] post IDs through other tools. So for example, ad spy, I don't pay for ad spy
[00:08:21.980] currently, so I
[00:08:22.960] couldn't check that. But it's a potential. And if anybody does know how to get
[00:08:27.110] the actual post ID
[00:08:28.480] over them being served the actual ad, then please let me know and I'll update
[00:08:33.650] the module
[00:08:34.480] accordingly. But yeah, hope you like this one. It's a real golden opportunity
[00:08:38.480] to get some really
[00:08:39.360] fresh data and angles.
