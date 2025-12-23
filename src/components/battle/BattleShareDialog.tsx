import { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { 
  Share2, 
  Download, 
  Link, 
  Copy, 
  Check,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShareableBattleCard } from './ShareableBattleCard';
import { ClanBattle, BattleContributor } from '@/lib/battleData';

interface BattleShareDialogProps {
  battle: ClanBattle;
  contributorsA: BattleContributor[];
  contributorsB: BattleContributor[];
  userClanId: string;
  trigger?: React.ReactNode;
}

export function BattleShareDialog({
  battle,
  contributorsA,
  contributorsB,
  userClanId,
  trigger,
}: BattleShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isUserClanA = userClanId === battle.clanA.id;
  const isWinner = battle.winner === (isUserClanA ? 'A' : 'B');
  const userClan = isUserClanA ? battle.clanA : battle.clanB;
  const opponentClan = isUserClanA ? battle.clanB : battle.clanA;

  // Generate shareable URL
  const shareUrl = `${window.location.origin}/battle/${battle.id}/results`;

  // Copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  }, [shareUrl]);

  // Download image
  const handleDownloadImage = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `battle-${battle.id}-result.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Image downloaded!');
    } catch (err) {
      console.error('Failed to generate image:', err);
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  }, [battle.id]);

  // Copy image to clipboard
  const handleCopyImage = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });
      
      // Convert to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      
      toast.success('Image copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy image:', err);
      toast.error('Failed to copy image. Try downloading instead.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Share to Twitter
  const handleShareTwitter = useCallback(() => {
    const text = isWinner
      ? `🏆 VICTORY! ${userClan.name} defeated ${opponentClan.name} in an epic clan battle!\n\n⚔️ ${battle.clanA.battleScore} vs ${battle.clanB.battleScore} XP\n\n#CodeArena #ClanBattle`
      : `⚔️ Intense clan battle! ${battle.clanA.name} vs ${battle.clanB.name}\n\n${battle.clanA.battleScore} vs ${battle.clanB.battleScore} XP\n\n#CodeArena #ClanBattle`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  }, [isWinner, userClan, opponentClan, battle, shareUrl]);

  // Share to WhatsApp
  const handleShareWhatsApp = useCallback(() => {
    const text = isWinner
      ? `🏆 *VICTORY!*\n\n${userClan.name} defeated ${opponentClan.name}!\n\n⚔️ Score: ${battle.clanA.battleScore} vs ${battle.clanB.battleScore} XP\n\nCheck out the results: ${shareUrl}`
      : `⚔️ *Clan Battle Results*\n\n${battle.clanA.name} vs ${battle.clanB.name}\n\nScore: ${battle.clanA.battleScore} vs ${battle.clanB.battleScore} XP\n\nCheck out the results: ${shareUrl}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [isWinner, userClan, opponentClan, battle, shareUrl]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share Result
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Battle Result
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Card */}
          <div className="flex justify-center overflow-hidden rounded-xl border border-border">
            <div className="transform scale-[0.85] origin-top">
              <ShareableBattleCard
                ref={cardRef}
                battle={battle}
                contributorsA={contributorsA}
                contributorsB={contributorsB}
                userClanId={userClanId}
              />
            </div>
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-2 gap-3">
            {/* Image Actions */}
            <Button
              variant="outline"
              onClick={handleDownloadImage}
              disabled={isGenerating}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Image
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyImage}
              disabled={isGenerating}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Image
            </Button>

            {/* Social Share */}
            <Button
              variant="outline"
              onClick={handleShareTwitter}
              className="gap-2"
            >
              <Twitter className="w-4 h-4" />
              Share on X
            </Button>
            <Button
              variant="outline"
              onClick={handleShareWhatsApp}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Share on WhatsApp
            </Button>
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
            <Link className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-sm text-muted-foreground outline-none"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyLink}
              className="gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-status-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
