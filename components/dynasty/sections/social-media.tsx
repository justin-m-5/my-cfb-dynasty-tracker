// components/dynasty/sections/social-media.tsx

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, TrendingUp, Heart, Star, Share2, Repeat2 } from 'lucide-react'
import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import { RecruitService, type Recruit } from '@/dal/features/recruits'
import { TransferService, type Transfer } from '@/dal/features/transfers'

interface SocialPost {
    id: string
    type: 'game_recap' | 'player_spotlight' | 'recruiting' | 'transfer' | 'news' | 'fan'
    author: string
    authorHandle: string
    authorType: 'official' | 'media' | 'fan'
    content: string
    timestamp: Date
    likes: number
    retweets: number
    comments: number
    verified: boolean
}

interface SocialMediaProps {
    dynastyId: string
}

// Media personalities
const MEDIA_OUTLETS = {
    espn: { name: 'ESPN College Football', handle: '@ESPNCFB', verified: true },
    on3: { name: 'On3 Recruits', handle: '@On3Recruits', verified: true },
    br: { name: 'Bleacher Report CFB', handle: '@BR_CFB', verified: true },
    recruiting247: { name: '247Sports', handle: '@247Sports', verified: true },
}

// Fan accounts
const FAN_ACCOUNTS = [
    { name: 'CFB Fanatic', handle: '@CFBFan2024', verified: false },
    { name: 'Gridiron Guru', handle: '@GridironGuru', verified: false },
    { name: 'Saturday Legend', handle: '@SaturdayLive', verified: false },
    { name: '12th Man', handle: '@Always12th', verified: true },
]

export function SocialMedia({ dynastyId }: SocialMediaProps) {
    const [filter, setFilter] = useState<'all' | 'news' | 'recruiting'>('all')
    const [loading, setLoading] = useState(true)

    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [roster, setRoster] = useState<RosterPlayer[]>([])
    const [recruits, setRecruits] = useState<Recruit[]>([])
    const [transfers, setTransfers] = useState<Transfer[]>([])

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const dyn = await DynastyService.getDynastyById(dynastyId)
            if (!dyn) {
                setLoading(false)
                return
            }
            setDynasty(dyn)

            const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
            if (!yr) {
                setLoading(false)
                return
            }

            const [g, r, rec, t] = await Promise.all([
                GameService.getGames(dynastyId, yr.id),
                PlayerService.getRoster(dynastyId, yr.id),
                RecruitService.getRecruits(dynastyId, yr.id),
                TransferService.getTransfers(dynastyId, yr.id),
            ])

            setGames(g)
            setRoster(r)
            setRecruits(rec)
            setTransfers(t)
            setLoading(false)
        }

        loadData()
    }, [dynastyId])

    const posts = useMemo(() => {
        if (!dynasty) return []

        const generated: SocialPost[] = []
        const now = new Date()

        // Official team account
        const officialAccount = {
            name: `${dynasty.school_name} Football`,
            handle: `@${dynasty.school_name.replace(/\s+/g, '')}FB`,
            verified: true,
        }

        // 1. Latest game recap
        const latestGame = [...games].reverse().find(g => g.result !== 'N/A' && g.result !== 'Bye')
        if (latestGame) {
            const isWin = latestGame.result === 'W'
            const content = isWin
                ? `🎉 That's a W! Final: ${dynasty.school_name} ${latestGame.score} vs ${latestGame.opponent}!\n\n#Go${dynasty.school_name.replace(/\s+/g, '')}`
                : `Tough battle today. ${dynasty.school_name} falls to ${latestGame.opponent}, ${latestGame.score}. We'll be back stronger. 💪`

            generated.push({
                id: `game-${latestGame.id}`,
                type: 'game_recap',
                author: officialAccount.name,
                authorHandle: officialAccount.handle,
                authorType: 'official',
                content,
                timestamp: new Date(now.getTime() - 6 * 3600000),
                likes: isWin ? 850 : 320,
                retweets: isWin ? 240 : 80,
                comments: isWin ? 150 : 60,
                verified: true,
            })

            // Fan reaction - use game ID as seed for stable random
            const fanIndex = latestGame.id.charCodeAt(0) % FAN_ACCOUNTS.length
            const fan = FAN_ACCOUNTS[fanIndex]
            const fanContent = isWin
                ? `LET'S GOOOOO!!! 🔥🔥🔥 #Go${dynasty.school_name.replace(/\s+/g, '')}`
                : `Tough one today. But we bounce back. Always. 💯 #${dynasty.school_name.replace(/\s+/g, '')}`

            // Use week number for stable engagement numbers
            const weekSeed = latestGame.week || 1
            generated.push({
                id: `fan-reaction-${latestGame.id}`,
                type: 'fan',
                author: fan.name,
                authorHandle: fan.handle,
                authorType: 'fan',
                content: fanContent,
                timestamp: new Date(now.getTime() - 5 * 3600000),
                likes: (weekSeed * 13) % 150 + 30,
                retweets: (weekSeed * 7) % 40 + 10,
                comments: (weekSeed * 5) % 25 + 5,
                verified: fan.verified,
            })
        }

        // 2. Player spotlight (top rated player)
        if (roster.length > 0) {
            const topPlayer = [...roster].sort((a, b) => (b.season.rating || 0) - (a.season.rating || 0))[0]
            generated.push({
                id: `spotlight-${topPlayer.id}`,
                type: 'player_spotlight',
                author: officialAccount.name,
                authorHandle: officialAccount.handle,
                authorType: 'official',
                content: `⭐ PLAYER SPOTLIGHT ⭐\n\n${topPlayer.name}\n${topPlayer.position} | ${topPlayer.season.year || 'FR'}\n${topPlayer.season.rating || '??'} OVR\n\n#${dynasty.school_name.replace(/\s+/g, '')}`,
                timestamp: new Date(now.getTime() - 2 * 86400000),
                likes: 420,
                retweets: 95,
                comments: 48,
                verified: true,
            })
        }

        // 3. Top recruit
        if (recruits.length > 0) {
            const topRecruit = [...recruits].sort((a, b) => (b.stars || 0) - (a.stars || 0))[0]
            const media = MEDIA_OUTLETS.recruiting247
            generated.push({
                id: `recruit-${topRecruit.id}`,
                type: 'recruiting',
                author: media.name,
                authorHandle: media.handle,
                authorType: 'media',
                content: `🚨 COMMITMENT ALERT 🚨\n\n${topRecruit.stars}⭐ ${topRecruit.position} ${topRecruit.name} commits to ${dynasty.school_name}!\n\nHuge pickup for Coach ${dynasty.coach_name}.`,
                timestamp: new Date(now.getTime() - 3 * 86400000),
                likes: 1200,
                retweets: 380,
                comments: 215,
                verified: true,
            })
        }

        // 4. Latest transfer
        if (transfers.length > 0) {
            const latestTransfer = transfers[0]
            const media = MEDIA_OUTLETS.espn
            generated.push({
                id: `transfer-${latestTransfer.id}`,
                type: 'transfer',
                author: media.name,
                authorHandle: media.handle,
                authorType: 'media',
                content: `🔁 TRANSFER NEWS\n\n${latestTransfer.player_name} (${latestTransfer.position}) → ${dynasty.school_name}\n\nStrong portal addition for the ${dynasty.school_nickname}.`,
                timestamp: new Date(now.getTime() - 1 * 86400000),
                likes: 650,
                retweets: 190,
                comments: 85,
                verified: true,
            })
        }

        // 5. Season hype post
        generated.push({
            id: 'season-hype',
            type: 'news',
            author: officialAccount.name,
            authorHandle: officialAccount.handle,
            authorType: 'official',
            content: `This is our year. 💪\n\n#Go${dynasty.school_name.replace(/\s+/g, '')} #CollegeFootball`,
            timestamp: new Date(now.getTime() - 7 * 86400000),
            likes: 580,
            retweets: 145,
            comments: 92,
            verified: true,
        })

        return generated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }, [dynasty, games, roster, recruits, transfers])

    const filteredPosts = useMemo(() => {
        if (filter === 'all') return posts
        if (filter === 'news') return posts.filter(p => ['game_recap', 'news', 'fan'].includes(p.type))
        if (filter === 'recruiting') return posts.filter(p => ['recruiting', 'transfer'].includes(p.type))
        return posts
    }, [posts, filter])

    if (loading) {
        return <div className="pt-10 text-sm text-text/60">Loading social feed...</div>
    }

    if (!dynasty) {
        return <div className="pt-10 text-sm text-red-500">Dynasty not found.</div>
    }

    return (
        <div className="space-y-4 pt-10">
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-center text-xl">Social Media Hub</CardTitle>
                    <p className="text-center text-sm text-text/60">Your dynasty&apos;s pulse on social media</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="flex justify-center gap-2 flex-wrap">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    bg={filter === 'all' ? 'var(--primary)' : undefined}
                    text={filter === 'all' ? 'white' : undefined}
                >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    All
                </Button>
                <Button
                    variant={filter === 'news' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('news')}
                    bg={filter === 'news' ? 'var(--primary)' : undefined}
                    text={filter === 'news' ? 'white' : undefined}
                >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    News
                </Button>
                <Button
                    variant={filter === 'recruiting' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('recruiting')}
                    bg={filter === 'recruiting' ? 'var(--primary)' : undefined}
                    text={filter === 'recruiting' ? 'white' : undefined}
                >
                    <Star className="h-4 w-4 mr-2" />
                    Recruiting
                </Button>
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {filteredPosts.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center text-text/60">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No posts yet. Play some games to see the feed come alive!</p>
                        </CardContent>
                    </Card>
                )}

                {filteredPosts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                            {/* Author */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold text-sm">
                                    {post.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm">{post.author}</span>
                                        {post.verified && <span className="text-blue-500">✓</span>}
                                        <span className="text-text/50 text-sm">{post.authorHandle}</span>
                                        <span className="text-text/40">·</span>
                                        <span className="text-text/50 text-sm">{post.timestamp.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-3">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between text-text/50 border-t border-primary/10 pt-3">
                                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="text-xs">{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                                    <Repeat2 className="h-4 w-4" />
                                    <span className="text-xs">{post.retweets}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                                    <Heart className="h-4 w-4" />
                                    <span className="text-xs">{post.likes.toLocaleString()}</span>
                                </button>
                                <button className="hover:text-blue-500 transition-colors">
                                    <Share2 className="h-4 w-4" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
                </CardContent>
            </Card>
        </div>
    )
}
