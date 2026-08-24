# Building Your Email Flow for Trust Pilot Growth

Source: Origins Program  
Classroom: https://www.skool.com/origins/classroom/03b8079b?md=d2c012fae957401998d5bc3bb133aedd  
Duration: 11:42  
Method: English CC + on-page notes

## Slide / lesson notes

How to build an automated post-purchase email flow that boosts your Trustpilot reviews, diverts negative feedback, and drives repeat store purchases using gift card incentives! 🎁

### 💡 Key Takeaways & Highlights:

⚡ Triggering the Flow: Learn how to set your flow trigger to Delivered Shipment (so customers receive the email while the experience is fresh) or use Placed Order with a delayed condition if delivery tracking isn't integrated.
- 
🎁 Incentivizing Reviews: Offer a store gift card as a reward for leaving an honest review. Setting the gift card value slightly lower than your store's minimum product price ensures customers return to make a repeat purchase!
- 
📊 Smart Star-Rating Logic:
4 & 5 Stars: Hyperlinked directly to your Trustpilot evaluate URL to build public social proof.
- 
1, 2, & 3 Stars: Hyperlinked to your internal review system (e.g., [Judge.me](http://Judge.me)) or support team so you can address issues privately before they turn into public negative reviews.
- 
- 
📈 UTM Tracking & Verification: Enable UTM tracking parameters to measure performance, and establish a simple verification process where customers reply to confirm their review and claim their gift card.
-

## Transcript (English CC)

[00:00:00.000] Okay, second part to this, we are now going to, again, trigger an email flow
[00:00:05.610] based on the
[00:00:06.800] customer receiving their products. All right, so very much like the module
[00:00:13.360] where we send it
[00:00:14.160] based on post purchase, this is going to be based on delivered shipment. Now,
[00:00:18.720] depending on when you
[00:00:19.760] create this flow, the delivered shipment trigger may or may not be available.
[00:00:25.680] So we'll look at
[00:00:26.640] another option to mitigate that as well. So first things first, we're going to
[00:00:30.240] click create flow on
[00:00:31.440] the top, right? And I'm just going to simply click build your own on the top
[00:00:37.200] here. Okay, I'm
[00:00:39.920] going to call this, let's call this new review flow based on delivered. Okay, I
[00:00:47.520] 'm going to create
[00:00:48.640] this manually. All right, on the left hand side, I'm going to go to all
[00:00:58.120] triggers. I can't see it
[00:01:02.800] in here. So let's go to recommended. Let's go to seal triggers. Okay, second,
[00:01:08.960] same thing.
[00:01:09.520] Okay, let's go to metrics. And we want to go to delivered shipment. Okay, so if
[00:01:15.840] you've got
[00:01:16.320] delivered shipment, select it. And now the trigger is going to be on delivered
[00:01:20.540] shipment. Now,
[00:01:21.600] if you do not have delivered shipment, what you want is the purchase trigger.
[00:01:26.470] So let's try and find
[00:01:28.160] that placed order. Sorry. So you want placed order. But what you would do is
[00:01:33.430] you add a delay
[00:01:34.640] condition to around, let's say 14 days or however long it takes for your
[00:01:38.960] product to definitely get
[00:01:40.080] to the customer, you know, around a day after predicted delivery date. So it's
[00:01:44.720] eight to 10
[00:01:45.200] business days do 11 business days later, or maybe like 13 calendar days later
[00:01:50.810] to to trigger this
[00:01:51.920] email. But in my case, because I have delivered shipments already and it's
[00:01:55.990] connected through to
[00:01:57.280] Shopify, I can then simply choose the delivered shipment figure. Okay, so I'm
[00:02:05.660] doing this at this
[00:02:06.800] point, by the way, because the customer's happy, they've received their order.
[00:02:10.640] And what you'll see
[00:02:12.000] in a minute is there's an incentive for them to actually fill out a review. So
[00:02:15.280] again, it's
[00:02:15.760] keeping this fresh in their minds at all times. And that's why I'm doing it as
[00:02:19.840] soon as delivered
[00:02:20.560] shipment has been updated. Now that happens automatically by the shipper, by
[00:02:24.480] the way.
[00:02:25.120] Once the customer's signed for it, or it's been dropped off, it'll be updated
[00:02:28.840] on the tracking link,
[00:02:29.760] the tracking link then updates the Shopify order, and then the status change to
[00:02:32.840] delivered shipment.
[00:02:33.840] All right, so we can keep this as it is. All right. There's no filters at all,
[00:02:38.480] making clicks save on here. Okay, we're going to click confirm and save. This
[00:02:42.800] is basically saying
[00:02:43.600] once you've done this, you cannot amend the trigger to something else. Okay,
[00:02:47.640] perfect. So what we want
[00:02:49.760] to do now is we want to add an email step to this trigger. We're going to
[00:02:53.960] simply click it from the
[00:02:55.280] left. We're going to drag that over the top here. And there's going to be no
[00:02:58.560] time delays. We want
[00:02:59.520] this to go instantly as soon as we've had that tracking update. And once you
[00:03:03.360] drag that in on the
[00:03:04.160] left hand side now, you get to enter a subject. And I like to have something
[00:03:08.480] like leave us a review.
[00:03:09.920] And in my case, receive a gift card. If you want to put emojis on there,
[00:03:17.920] you can put emojis on there. And obviously, I'm giving you my example with the
[00:03:21.840] gift card.
[00:03:22.320] The reason why I use a gift card is simple, because my lowest item on my store
[00:03:30.220] is 999.
[00:03:33.200] So what I do is I give them a, let's say, a five pound gift card, or whatever
[00:03:39.910] your lowest amount
[00:03:42.000] of your product is, give them less, because then they're going to have to come
[00:03:45.770] to your store to
[00:03:46.640] spend that gift card anyway. And you're getting a review for this. Okay, so the
[00:03:51.180] incentive is to get
[00:03:52.080] a gift card. But you also get a review and it forces them to spend if they want
[00:03:56.980] to spend,
[00:03:57.600] because there's an item that is higher priced. So leave us a review and get a
[00:04:01.640] gift card. You can
[00:04:02.640] have emojis on there as well. You can have some preview text. And then what we
[00:04:06.820] 're also going to do
[00:04:08.480] is we're going to make sure that we enable the UTM tracking. So this just
[00:04:12.600] allows the, it's called
[00:04:13.680] Urching Tracking Module, and allows us to track properly through very much like
[00:04:18.170] you can do in your
[00:04:19.360] ads manager. Okay, so we're now going to select a template. Now you can build a
[00:04:25.450] template from
[00:04:26.480] scratch if you want to. This lesson won't take you through how to do that. You
[00:04:29.610] can look at that
[00:04:30.240] YouTube. But for the purpose of this, we'll look at selecting an existing one
[00:04:33.670] and modifying it.
[00:04:34.960] The reason why it has to be a tab HTML custom one is because we want to add in
[00:04:39.600] some images to
[00:04:40.960] the email. So I'm going to go ahead and select template here. And I'm going to
[00:04:45.440] just choose
[00:04:46.160] our random one for the purpose of this, something that easy, because we're
[00:04:48.980] going to be taking away
[00:04:50.320] all the rubbish off it anyway. So we're going to select it. And we can just
[00:04:54.460] choose use template.
[00:04:58.240] Okay, once the template's loaded, we can go ahead and just take out all the
[00:05:01.680] stuff we don't want.
[00:05:02.400] So we're clicking into the sections here, and we are deleting out all these
[00:05:06.610] bits and pieces.
[00:05:07.520] Now, as I said, you can create your own template. Look for the purpose of this.
[00:05:13.010] I'm just doing
[00:05:13.520] this with speed, adapting a previous template that I know has image placements
[00:05:19.130] and so on.
[00:05:21.840] Okay, so there's a lot of stuff in there that would take you out. You don't
[00:05:25.970] necessarily even need
[00:05:27.360] this footer, but you can add a footer if you want. Let's take out this whole
[00:05:33.570] section as well.
[00:05:34.960] Okay, so we can go ahead and we can add in an amend to our brand name. You can
[00:05:42.860] also add your
[00:05:43.280] logo as well. So logo here. And now we start to write what we want. So,
[00:05:49.920] so this is going to be really simple. It's going to be leave us our review and
[00:05:56.280] receive a gift card
[00:06:02.240] to use in our store. We simply rate us out of five stars. I'm just double
[00:06:12.640] checking what we've got
[00:06:13.280] on my main brand as well. Okay, I'm just going to incentivize this. Let's put
[00:06:17.680] this maybe a little
[00:06:18.240] bit bigger gift card. Okay, cool. Now let's wipe out this button as well. Okay,
[00:06:26.140] and we are going to
[00:06:28.480] amend this to five columns. So just simply go to styles. We want to add in
[00:06:35.450] columns here. I'm going
[00:06:37.120] to add five columns. Okay, and we're going to want to make sure that we are all
[00:06:43.210] showing on desktop and
[00:06:45.200] mobile, which is perfect. And we want them all to be image based cells. So we
[00:06:52.380] 're going to go back
[00:06:54.240] to the content here. And on each of these columns that we can now see on the
[00:06:58.150] top, we're going to
[00:06:58.880] swap these two images like so. Okay, so what we're doing here, we are creating
[00:07:06.850] a table with five
[00:07:08.560] individual images. And these are going to be five individual stars with five
[00:07:14.170] individual hyperlinks
[00:07:15.760] on. Okay, now the whole purpose here is we want to build our trust pilot. And
[00:07:21.330] we only want four and
[00:07:22.800] five stars on trust pilot. Anything below that, we want to push them to our own
[00:07:28.410] website. Okay,
[00:07:29.600] now I'm assuming you've got judge.me or Luke, so whatever it is that you're
[00:07:33.130] using for your reviews,
[00:07:34.480] that is what you will hyperlink across your bottom one to three stars and your
[00:07:38.690] trust pilot between
[00:07:39.680] four to five. So let's go ahead and build the rest of this out. All right, so
[00:07:44.050] you'd find a star,
[00:07:45.600] you can get this off Google, make sure it's transparent. And for the purpose of
[00:07:48.100] this, I've
[00:07:48.560] just chose one from Google, you consider a white background. Now I could change
[00:07:52.250] the table background
[00:07:53.120] to be white as well. But if you were doing this properly, I would advise having
[00:07:56.950] a PNG with a
[00:07:57.440] transparent background. So I'm going to go ahead and add in the stars to all
[00:08:01.300] the other cells now.
[00:08:02.320] Okay, cool. So once we built out the table, we built out the stars, we now have
[00:08:07.280] to go to each
[00:08:08.400] cell indicated at the top, and we're going to give it a link address. So this
[00:08:11.650] would be your judge.me
[00:08:13.200] to your domain name. And then judge.me reviews the bottom. So what I like to do
[00:08:21.520] is, and if you
[00:08:22.240] don't know this already, by the way, just get your domain name to your products
[00:08:26.280] , your hair products,
[00:08:27.280] whichever one it is you want them to review. And if you put on at the end
[00:08:31.410] hashtag review,
[00:08:32.480] it will take you down the bottom to the reviews if you're using judge.me. So
[00:08:37.520] that's a little anchor
[00:08:38.720] there that that they use. You can use that. So we're going to go ahead and copy
[00:08:42.760] that into stars one,
[00:08:44.000] two, and three, and then cells three, what we're going to do is go back to our
[00:08:51.960] trust pilot,
[00:08:53.120] and we're going to copy the trust pilot, evaluate button or URL. And we're
[00:08:59.360] going to paste that now
[00:09:00.800] into our fourth and fifth star. Okay, we do it on the fifth one as well. Cool.
[00:09:10.720] Okay, so now
[00:09:12.080] customer clicks one, two or three, they're going to go to judge me. And you
[00:09:15.330] know, if they're not happy,
[00:09:16.640] well, we don't have to publish it on our website. If they are happy, however,
[00:09:20.000] and they click four
[00:09:20.640] and five, then they're going to go to trust pilot and it's going to interest on
[00:09:23.370] our trust pilot to
[00:09:25.120] whatever, you know, if you get to, or really good way to mitigate customer vib
[00:09:29.230] es against good customer
[00:09:30.720] vibes as well. Now, just as a last bit to this, what we need to finish this off
[00:09:34.680] with is just a
[00:09:35.360] text at the bottom just to get them a little bit more information as to why we
[00:09:38.250] want them to fill
[00:09:39.040] this in and how this is going to work, like how did they get the gift card,
[00:09:42.100] which is just going
[00:09:42.880] to be a simple text one. You can also just duplicate this if you want to put
[00:09:46.760] your mouse over it,
[00:09:47.840] click duplicate, we can then drag this down and put it under here. And now we
[00:09:56.580] can edit this one.
[00:09:57.440] So say something like this. All right, so very rough and ready here. You'd
[00:10:03.200] obviously make this
[00:10:03.840] a lot more sexy than I've made it, but essentially what we're asking them to do
[00:10:06.890] is to leave an honest
[00:10:07.840] review, it takes two minutes. So pretty far now, I'm just going to take helps
[00:10:11.670] us improve. And what
[00:10:12.560] do they get? They get a gift card. Okay, they don't know how much they're
[00:10:15.120] getting in the gift card.
[00:10:16.480] As I said before, mine's less value. It's like, let's have a 10 pounds or five
[00:10:20.250] pounds. I can't
[00:10:20.720] remember what my product is priced higher than that. So they have to spend
[00:10:24.300] money with my store.
[00:10:25.440] What's the process here? They simply reply to the email with their name. And
[00:10:30.310] what we'll do is we'll
[00:10:31.120] check the trust pilot to make sure they've actually submitted one. And then
[00:10:34.480] what we'll do is I'll
[00:10:35.200] have my customer success team. They'll manually send a gift card to that
[00:10:40.020] customer by copying the
[00:10:41.920] email address from either their order, if we can find their name, or the email
[00:10:47.200] that they've
[00:10:47.600] responded back to in this request here. Okay. And then at the bottom, we are
[00:10:52.560] pre-framing here
[00:10:53.840] that we want them to click five stars. But then also, lastly, if they do have a
[00:10:58.240] problem,
[00:10:58.800] just email was back because this email from my clavy actually goes to my
[00:11:03.670] customer support
[00:11:04.480] ticketing system as well. And the team can figure out why before they leave,
[00:11:08.640] you know,
[00:11:09.440] or they try to leave a bad review on trust pilot, which is just going to go to
[00:11:12.560] judgment.me. But
[00:11:13.760] ultimately, we want to service our customers, right? We want that long-term
[00:11:16.990] value or lifetime
[00:11:18.000] value. So we want to make them happy. Okay. So this is a super simple way to
[00:11:23.610] gather and grow
[00:11:24.400] your trust pilot. And if you aren't doing this, yeah, I suggest you do this. It
[00:11:28.560] will take maybe
[00:11:29.520] an hour to set up at first, but it's then a repeatable thing that you don't
[00:11:33.580] have to touch
[00:11:34.720] or within sending the gift card out. And let me know how you get on with this.
[00:11:39.040] And any questions,
[00:11:39.840] please let me know.
