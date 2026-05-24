/**
 * seed-lyrics-blackpink-deadline.ts
 *
 * Seeds lyricsKo / lyricsEn / lyricsRomanized for the 5 Deadline (2026) songs.
 * Sources: klyrics.net, lyricsbull.com
 *
 * Note: Go, Champion, Fxxxboy, Me And My are entirely in English.
 *       뛰어 (JUMP) is mixed Korean/English.
 *
 * Run:
 *   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-lyrics-blackpink-deadline.ts
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const LYRICS: Array<{
  slug: string;
  title: string;
  lyricsKo: string;
  lyricsEn: string;
  lyricsRomanized: string;
}> = [
  {
    slug: "blackpink-deadline-go",
    title: "Go",
    lyricsKo: `I'm on a mission
I'm in control
I want your body
I want your soul
Here to the rescue
I'm number one
Your guardian angel
Your kingdom come
March to the beat of
Beat of my drum
'Cause when I call you
You're gonna come
Hold in position
It's gonna blow
You only move when
When I say so
GO
Blackpink'll make ya
GO
Blackpink'll make ya
Go get it, Imma go get it
Never gonna settle for second
I need a gold medal
Get up on the floor, tell me when to go, no slow jams
Bumpin through the speakers when I do my go go dance
Oh no, I go when I wanna I go, I'm so gone
Go reckless, go off, like what could go wrong
I'm goin all in, you should know that's my go-to
My whole crew with me, if I go then they go too
March to the beat of
Beat of my drum
'Cause when I call you
You're gonna come
Hold in position
It's gonna blow
You only move when
When I say so
GO
Blackpink'll make ya
GO
Blackpink'll make ya
When your heart is broken baby
Darkness on the edge of town
Try to keep it open baby
Try to let your walls come down
I know you're frozen baby
Love can make you turn to stone
You could stop and be alone
Or you could
GO
Blackpink'll make ya
GO
I'm on a mission
Mission mission mission`,
    lyricsEn: `I'm on a mission
I'm in control
I want your body
I want your soul
Here to the rescue
I'm number one
Your guardian angel
Your kingdom come
March to the beat of
Beat of my drum
'Cause when I call you
You're gonna come
Hold in position
It's gonna blow
You only move when
When I say so
GO
Blackpink'll make ya
GO
Blackpink'll make ya
Go get it, Imma go get it
Never gonna settle for second
I need a gold medal
Get up on the floor, tell me when to go, no slow jams
Bumpin through the speakers when I do my go go dance
Oh no, I go when I wanna I go, I'm so gone
Go reckless, go off, like what could go wrong
I'm goin all in, you should know that's my go-to
My whole crew with me, if I go then they go too
March to the beat of
Beat of my drum
'Cause when I call you
You're gonna come
Hold in position
It's gonna blow
You only move when
When I say so
GO
Blackpink'll make ya
GO
Blackpink'll make ya
When your heart is broken baby
Darkness on the edge of town
Try to keep it open baby
Try to let your walls come down
I know you're frozen baby
Love can make you turn to stone
You could stop and be alone
Or you could
GO
Blackpink'll make ya
GO
I'm on a mission
Mission mission mission`,
    lyricsRomanized: `I'm on a mission
I'm in control
I want your body
I want your soul
Here to the rescue
I'm number one
Your guardian angel
Your kingdom come
March to the beat of
Beat of my drum
'Cause when I call you
You're gonna come
Hold in position
It's gonna blow
You only move when
When I say so
GO
Blackpink'll make ya
GO
Blackpink'll make ya
Go get it, Imma go get it
Never gonna settle for second
I need a gold medal
Get up on the floor, tell me when to go, no slow jams
Bumpin through the speakers when I do my go go dance
Oh no, I go when I wanna I go, I'm so gone
Go reckless, go off, like what could go wrong
I'm goin all in, you should know that's my go-to
My whole crew with me, if I go then they go too
March to the beat of
Beat of my drum
'Cause when I call you
You're gonna come
Hold in position
It's gonna blow
You only move when
When I say so
GO
Blackpink'll make ya
GO
Blackpink'll make ya
When your heart is broken baby
Darkness on the edge of town
Try to keep it open baby
Try to let your walls come down
I know you're frozen baby
Love can make you turn to stone
You could stop and be alone
Or you could
GO
Blackpink'll make ya
GO
I'm on a mission
Mission mission mission`,
  },
  {
    slug: "blackpink-deadline-fxxxboy",
    title: "Fxxxboy",
    lyricsKo: `Everybody needs love
Do you do you
Really wanna go down that road tonight?
Do you do you
We already tried it once or twice
Just to end up hitting the wall oh
If my signals mixed and messy
Bet you think it's destiny
Call my ex send late night texts
Cuz I get off on jealousy
Keep your expectations
Underneath the pavement
Guess karma's a bitch
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played the game but I kept the score
How's it feel now I'm the fxxxboy
Uh
Phone is unavail unavail
If u wanna hit me try my other cell cuz I ain't pickin up
Had enough, Beep beep da-da-da
If u play w my emotions
You already know what's up
I'm so tired of the fake love
Can't let no tears ruin my make up
Say how do you sleep knowing
That my love was like heaven
Til you gave me hell
If my signals mixed and messy
Bet you think it's destiny
Call my ex send late night texts
Cuz I get off on jealousy
Keep your expectations
Underneath the pavement
Guess karma's a bitch
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played your game but I kept the score
How's it feel now I'm the fxxxboy
Ooh, oh, if I told you it's not that serious
Heartbreak builds experience
It's evident that
You burned the bridge, I'm on fire
You set the tone, now I'm louder
I don't like you I'm just bored
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played your game but I kept the score
How's it feel now I'm the fxxxboy`,
    lyricsEn: `Everybody needs love
Do you do you
Really wanna go down that road tonight?
Do you do you
We already tried it once or twice
Just to end up hitting the wall oh
If my signals mixed and messy
Bet you think it's destiny
Call my ex send late night texts
Cuz I get off on jealousy
Keep your expectations
Underneath the pavement
Guess karma's a bitch
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played the game but I kept the score
How's it feel now I'm the fxxxboy
Uh
Phone is unavail unavail
If u wanna hit me try my other cell cuz I ain't pickin up
Had enough, Beep beep da-da-da
If u play w my emotions
You already know what's up
I'm so tired of the fake love
Can't let no tears ruin my make up
Say how do you sleep knowing
That my love was like heaven
Til you gave me hell
If my signals mixed and messy
Bet you think it's destiny
Call my ex send late night texts
Cuz I get off on jealousy
Keep your expectations
Underneath the pavement
Guess karma's a bitch
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played your game but I kept the score
How's it feel now I'm the fxxxboy
Ooh, oh, if I told you it's not that serious
Heartbreak builds experience
It's evident that
You burned the bridge, I'm on fire
You set the tone, now I'm louder
I don't like you I'm just bored
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played your game but I kept the score
How's it feel now I'm the fxxxboy`,
    lyricsRomanized: `Everybody needs love
Do you do you
Really wanna go down that road tonight?
Do you do you
We already tried it once or twice
Just to end up hitting the wall oh
If my signals mixed and messy
Bet you think it's destiny
Call my ex send late night texts
Cuz I get off on jealousy
Keep your expectations
Underneath the pavement
Guess karma's a bitch
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played the game but I kept the score
How's it feel now I'm the fxxxboy
Uh
Phone is unavail unavail
If u wanna hit me try my other cell cuz I ain't pickin up
Had enough, Beep beep da-da-da
If u play w my emotions
You already know what's up
I'm so tired of the fake love
Can't let no tears ruin my make up
Say how do you sleep knowing
That my love was like heaven
Til you gave me hell
If my signals mixed and messy
Bet you think it's destiny
Call my ex send late night texts
Cuz I get off on jealousy
Keep your expectations
Underneath the pavement
Guess karma's a bitch
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played your game but I kept the score
How's it feel now I'm the fxxxboy
Ooh, oh, if I told you it's not that serious
Heartbreak builds experience
It's evident that
You burned the bridge, I'm on fire
You set the tone, now I'm louder
I don't like you I'm just bored
How's it feel now I'm the fxxxboy
It's the way that it goes
Call me icy icy
Yeah you made me ice cold uh
I saw it all front row
Shoulda won a prize for the stories you told
Oh oh oh oh
Played your game but I kept the score
How's it feel now I'm the fxxxboy`,
  },
  {
    slug: "blackpink-deadline-champion",
    title: "Champion",
    lyricsKo: `Ain't quitting, I trust my intuition (okay)
Time ticking, but they don't see the vision (okay)
I ain't giving up no I ain't willing (okay)
I be winning, like it's an addiction
Head high run into the sky
I live in the clouds
No lie look into my eyes
You can't take me out
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion
Pull up, four in a sprinter (okay)
We eat, losers for dinner (okay)
Hit hard, hard like a heart attack (okay)
Same team, girl yeah I got your back
Head high run into the sky
I live in the clouds (and I'm looking over you)
No lie look into my eyes
You can't take me out (even if you wanted to)
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion
Champion
I'm a champion
Champion
I'm a champion
Blackpink Blackpink Blackpink Blackpink
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion`,
    lyricsEn: `Ain't quitting, I trust my intuition (okay)
Time ticking, but they don't see the vision (okay)
I ain't giving up no I ain't willing (okay)
I be winning, like it's an addiction
Head high run into the sky
I live in the clouds
No lie look into my eyes
You can't take me out
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion
Pull up, four in a sprinter (okay)
We eat, losers for dinner (okay)
Hit hard, hard like a heart attack (okay)
Same team, girl yeah I got your back
Head high run into the sky
I live in the clouds (and I'm looking over you)
No lie look into my eyes
You can't take me out (even if you wanted to)
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion
Champion
I'm a champion
Champion
I'm a champion
Blackpink Blackpink Blackpink Blackpink
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion`,
    lyricsRomanized: `Ain't quitting, I trust my intuition (okay)
Time ticking, but they don't see the vision (okay)
I ain't giving up no I ain't willing (okay)
I be winning, like it's an addiction
Head high run into the sky
I live in the clouds
No lie look into my eyes
You can't take me out
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion
Pull up, four in a sprinter (okay)
We eat, losers for dinner (okay)
Hit hard, hard like a heart attack (okay)
Same team, girl yeah I got your back
Head high run into the sky
I live in the clouds (and I'm looking over you)
No lie look into my eyes
You can't take me out (even if you wanted to)
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion
Champion
I'm a champion
Champion
I'm a champion
Blackpink Blackpink Blackpink Blackpink
If I ever ever fall down one time
Ima keep going on
'Cause I know I'm a champion
And if I take a take a L I'll still fight
Till the bitter end I'm strong
'Cause I know I'm a champion`,
  },
  {
    slug: "blackpink-deadline-me-and-my",
    title: "Me And My",
    lyricsKo: `We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls
Just me and my girls
That's a little sitch
Pretty privilege
Pop off she could fizz
If she wants to
You know that's my girl
When I call her bitch
That's a complement
Take over the shit
Like she was born to
La la la la la buying out the bar
We some superstars
Everywhere we are
We keep it real cute
Mirror on the wall
This ain't from the mall
Courtside on the call
We can touch the ball
That's how we move
If we ain't in the spot ain't a party
We gone make it pop like a lolli
Pull up with a lot serving body
Put your hands up if you're with me
We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls
Just me and my day ones pretty girls walking
Golden like we Draymond they pay us for a walk in
Step, step, step into some commas
Yeah, yeah, boys all wanna holla
I'm one of one not two
In my hottie season
Giving tude to ya
I don't need no reason
Daisy dukes make me speak my mind
I'm beaming
Kinda cute glistening
It's in her being
If we ain't in the spot ain't a party
We gone make it pop like a lolli
Pull up with a lot serving body
Put your hands up if you're with me
We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls`,
    lyricsEn: `We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls
Just me and my girls
That's a little sitch
Pretty privilege
Pop off she could fizz
If she wants to
You know that's my girl
When I call her bitch
That's a complement
Take over the shit
Like she was born to
La la la la la buying out the bar
We some superstars
Everywhere we are
We keep it real cute
Mirror on the wall
This ain't from the mall
Courtside on the call
We can touch the ball
That's how we move
If we ain't in the spot ain't a party
We gone make it pop like a lolli
Pull up with a lot serving body
Put your hands up if you're with me
We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls
Just me and my day ones pretty girls walking
Golden like we Draymond they pay us for a walk in
Step, step, step into some commas
Yeah, yeah, boys all wanna holla
I'm one of one not two
In my hottie season
Giving tude to ya
I don't need no reason
Daisy dukes make me speak my mind
I'm beaming
Kinda cute glistening
It's in her being
If we ain't in the spot ain't a party
We gone make it pop like a lolli
Pull up with a lot serving body
Put your hands up if you're with me
We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls`,
    lyricsRomanized: `We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls
Just me and my girls
That's a little sitch
Pretty privilege
Pop off she could fizz
If she wants to
You know that's my girl
When I call her bitch
That's a complement
Take over the shit
Like she was born to
La la la la la buying out the bar
We some superstars
Everywhere we are
We keep it real cute
Mirror on the wall
This ain't from the mall
Courtside on the call
We can touch the ball
That's how we move
If we ain't in the spot ain't a party
We gone make it pop like a lolli
Pull up with a lot serving body
Put your hands up if you're with me
We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls
Just me and my day ones pretty girls walking
Golden like we Draymond they pay us for a walk in
Step, step, step into some commas
Yeah, yeah, boys all wanna holla
I'm one of one not two
In my hottie season
Giving tude to ya
I don't need no reason
Daisy dukes make me speak my mind
I'm beaming
Kinda cute glistening
It's in her being
If we ain't in the spot ain't a party
We gone make it pop like a lolli
Pull up with a lot serving body
Put your hands up if you're with me
We outside, every night, just me and my girls (ay)
Way too fine, every time, just me and my girls (ay)
Hide your man, we ain't playing, just me and my girls (ay)
Dropping it, popping it
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls (ay)
Just me and my girls`,
  },
  {
    slug: "blackpink-deadline-jump",
    title: "뛰어(JUMP)",
    // Mixed Korean/English — Korean lines kept in original, English lines as-is
    lyricsKo: `I know they need to turn up
Used to see me out of these lights, saw my tears turn to ice
That's the sweetest escape
Every time that feeling kicks in, I might stay through the night
Bet you're getting it now
Rock that DDU-DU DDU-DU now
착각하지마 누가 누군지 woah-oh-oh
Think you're running that
Guess we're going down
I walk it, yeah, I talk it
하나 둘 셋 jump
Jump
Jump
Jump
Jump
So come up with me, I'll take you high
That Primadonna spice up your life
You know I got that shit that you like
So come with me, run up, uh, jump (Jump)
Watch me running up the place
I'm already starting and my girls are on the way (Jump)
Watch me open up the place
Wanna see you bumping, baby, bouncing to the bass
Are you not entertained?
I ain't gotta explain
I'm with all of my sisters, got em going insane, yeah
You know we on a mission, yeah, full gas, no brakes, yeah
Breaking out of the system, breaking out of this cage, yeah
Bet you're getting it now
순간 잊지마 누가 누군지, woah-oh-oh
Think you're running that
Guess we're going down
I walk it, yeah, I talk it
하나 둘 셋 jump
뛰어
뛰어
뛰어
뛰어
So come up with me, I'll take you high (Hey)
That Primadonna spice up your life (Woo)
You know I got that shit that you like
So come with me, run up, uh, jump (Jump)
Watch me burning up the place
I'm already starting and my girls are on the way (Jump)
Watch me open up the place
Wanna see you bumping, baby, bouncing to the bass
BLACKPINK in your area
Area
Jump
Jump
Jump
Jump, jump, jump
Jump
Jump, jump, jump, jump, jump, jump
Jump`,
    lyricsEn: `I know they need to turn up
Used to see me out of these lights, saw my tears turn to ice
That's the sweetest escape
Every time that feeling kicks in, I might stay through the night
Bet you're getting it now
Rock that DDU-DU DDU-DU now
Don't be mistaken, who's who, woah-oh-oh
Think you're running that
Guess we're going down
I walk it, yeah, I talk it
One two three jump
Jump
Jump
Jump
Jump
So come up with me, I'll take you high
That Primadonna spice up your life
You know I got that shit that you like
So come with me, run up, uh, jump (Jump)
Watch me running up the place
I'm already starting and my girls are on the way (Jump)
Watch me open up the place
Wanna see you bumping, baby, bouncing to the bass
Are you not entertained?
I ain't gotta explain
I'm with all of my sisters, got em going insane, yeah
You know we on a mission, yeah, full gas, no brakes, yeah
Breaking out of the system, breaking out of this cage, yeah
Bet you're getting it now
Don't forget for a moment, who's who, woah-oh-oh
Think you're running that
Guess we're going down
I walk it, yeah, I talk it
One two three jump
Jump (뛰어)
Jump (뛰어)
Jump (뛰어)
Jump (뛰어)
So come up with me, I'll take you high (Hey)
That Primadonna spice up your life (Woo)
You know I got that shit that you like
So come with me, run up, uh, jump (Jump)
Watch me burning up the place
I'm already starting and my girls are on the way (Jump)
Watch me open up the place
Wanna see you bumping, baby, bouncing to the bass
BLACKPINK in your area
Area
Jump
Jump
Jump
Jump, jump, jump
Jump
Jump, jump, jump, jump, jump, jump
Jump`,
    lyricsRomanized: `I know they need to turn up
Used to see me out of these lights, saw my tears turn to ice
That's the sweetest escape
Every time that feeling kicks in, I might stay through the night
Bet you're getting it now
Rock that DDU-DU DDU-DU now
Chakgak haji ma nuga nugunji woah-oh-oh
Think you're running that
Guess we're going down
I walk it, yeah, I talk it
Hana dul set jump
Jump
Jump
Jump
Jump
So come up with me, I'll take you high
That Primadonna spice up your life
You know I got that shit that you like
So come with me, run up, uh, jump (Jump)
Watch me running up the place
I'm already starting and my girls are on the way (Jump)
Watch me open up the place
Wanna see you bumping, baby, bouncing to the bass
Are you not entertained?
I ain't gotta explain
I'm with all of my sisters, got em going insane, yeah
You know we on a mission, yeah, full gas, no brakes, yeah
Breaking out of the system, breaking out of this cage, yeah
Bet you're getting it now
Sungan itji ma nuga nugunji, woah-oh-oh
Think you're running that
Guess we're going down
I walk it, yeah, I talk it
Hana dul set jump
Ttwieo
Ttwieo
Ttwieo
Ttwieo
So come up with me, I'll take you high (Hey)
That Primadonna spice up your life (Woo)
You know I got that shit that you like
So come with me, run up, uh, jump (Jump)
Watch me burning up the place
I'm already starting and my girls are on the way (Jump)
Watch me open up the place
Wanna see you bumping, baby, bouncing to the bass
BLACKPINK in your area
Area
Jump
Jump
Jump
Jump, jump, jump
Jump
Jump, jump, jump, jump, jump, jump
Jump`,
  },
];

async function main() {
  for (const entry of LYRICS) {
    if (!entry.lyricsKo.trim()) {
      console.log(`⏭  Skip (empty): ${entry.title}`);
      continue;
    }
    const song = await prisma.song.findUnique({ where: { slug: entry.slug } });
    if (!song) {
      console.warn(`⚠️  Not found: ${entry.slug}`);
      continue;
    }
    if (song.lyricsKo) {
      console.log(`⏭  Skip (already has lyrics): ${entry.title}`);
      continue;
    }
    await prisma.song.update({
      where: { slug: entry.slug },
      data: {
        lyricsKo:        entry.lyricsKo.trim(),
        lyricsEn:        entry.lyricsEn.trim(),
        lyricsRomanized: entry.lyricsRomanized.trim(),
      },
    });
    console.log(`✓ ${entry.title}`);
  }
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
