# Dig2Pin

<Center>
<img style="width: 50%" src="https://raw.githubusercontent.com/Dig2Pin/Dig2Pin/master/public/logo.png">
</Center>

**Dig2Pin** is a social bookmarking platform to discover, pin, and comment interesting instant links in your friend circle.

> **Dig**
> Discover interesting instant links through your social network and system recommendation. Pin links you need to your pinboard.
>
> **Pin**
> Pin interesting links from "Dig Board" or URL, make it easy to find, and manage links you pinned on the pinboard. 
>
>**Unpin**
>If there are too many people downvote a link, we will remove the link from the platform.
>
> **Get Points** 
>You can get points by sharing good links or react with links pinned by others. You can use points for more advanced functions. Also, we will make a marketplace using points.

# Motivation
There are a bunch of links on the internet, some are instant and some are outdated or useless. We use the social network power to distinguish them.

# Road Map

```mermaid
graph TD

A[Github Page] --We are currently in this stage--> AA[Build the 1st alpha version as an </br> event & news sharing website.]
A --We are currently in this stage--> AB[Brain storming & team building.]

AA --> AAA[Promote in the events community.]
AA-->AAB[Build the 2nd alpha version </br> to pin and comment on links.]
AB -->AAB

AAA --> AAAA[Search for seed investors.]
AAB --> AAAA
AAB --> AAAB[Build 3rd alpha version with </br> community and friend function.]

AAAA --> AAAAA[Build beta version with interactive points function.]
AAAB --> AAAAA

AAAAA --> AAAAAA[Release beta version.]

```

# build with us

### We'll use the CMS Node.js framwork [keystone.js](https://github.com/keystonejs/keystone) to get start our project. 

```
1. Make sure you have Node.js >= 10.x by $ node --version

2. Make sure you have npm by $ npm --version

3. Make sure you have yarn by $ yarn --version

4. MongoDB >= 4.x; $ mongod

5. Open another window $ git clone https://github.com/Dig2Pin/Dig2Pin

6. $ cd Dig2Pin

7. $ npm install

8. Change the file ".env.example" into ".env", modify the parameters in the .env file.

9. $ yarn dev

10. check http://localhost:3000

```

files inside site folder is copy from keystone blog example, need to modify.

# Join Us
We are team from MeetUGo.Com platform,  which is a social calendar. We find out people have need to find more useful events in their social network. And we upgrade the idea to more formal links.

We are in the early stage. Contact us via huanry@mail.meetugo.com