import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Trophy } from "lucide-react";
import { useGetMyBidPackage } from "@/hooks/useGetMyBidPackage";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/AuthProvider";

export default function BiddingPortal() {
  const { accessToken } = useAuth();
  const [timeLeft, setTimeLeft] = useState("");
  const { data, isLoading } = useGetMyBidPackage();
  const socketRef = useSocket(accessToken);
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleConnect = () => {
      console.log("✅ Connected to Socket.IO server!", socket.id);
    };
    const handleDisconnect = (reason) => {
      console.log("❌ Disconnected from Socket.IO server:", reason);
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socketRef]);

  // Destructure API safely
  const {
    cr97b_submissiondeadline,
    cr97b_name,
    cr97b_bidpackagecode,
    cr97b_description,
    hasBid,
    myBid,
    bids = [], // expected array from API in future
  } = data || {};

  useEffect(() => {
    if (!cr97b_submissiondeadline) return;

    const calculateTimeLeft = () => {
      const deadline = new Date(cr97b_submissiondeadline);
      const now = new Date();
      const difference = deadline - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
      return "Expired";
    };

    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [cr97b_submissiondeadline]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Leading":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Trophy className="w-3 h-3 mr-1" />
            Leading
          </Badge>
        );
      case "My Bid":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <User className="w-3 h-3 mr-1" />
            My Bid
          </Badge>
        );
      default:
        return <Badge variant="secondary">Outbid</Badge>;
    }
  };

  const rankedBids = useMemo(() => {
    if (!Array.isArray(bids)) return [];
    return [...bids]
      .sort((a, b) => a.price - b.price)
      .map((b, i) => ({
        ...b,
        rank: i + 1,
      }));
  }, [bids]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-200">
        <span className="text-lg text-neutral-600 animate-pulse">Loading bid package...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-200">
        <span className="text-lg text-neutral-600">No bid package available.</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4">
      <div className="p-4">
        <h2 className="text-lg font-bold">Socket.IO Test</h2>
        <p>Check your browser console for connection status.</p>
      </div>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ---------------- Header ---------------- */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-primary text-white rounded-t-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <CardTitle className="text-2xl font-bold mb-1">{cr97b_name}</CardTitle>
                <p className="text-white/90 text-lg">{cr97b_bidpackagecode}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1 justify-end">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm text-neutral-100/80">Submission Deadline</span>
                </div>
                <div
                  className={`
      text-2xl font-extrabold tracking-wide
      ${
        timeLeft === "Expired"
          ? "text-neutral-400"
          : timeLeft.includes("d") || timeLeft.includes("h")
            ? "text-[--color-accent]"
            : "text-[--color-error] animate-pulse"
      }
    `}
                >
                  {timeLeft}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* ---------------- Description ---------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bid Package Description</CardTitle>
          </CardHeader>
          <CardContent>
            {cr97b_description ? (
              <p className="text-neutral-700 leading-relaxed">{cr97b_description}</p>
            ) : (
              <p className="text-neutral-400 italic">No description provided.</p>
            )}
          </CardContent>
        </Card>

        {/* ---------------- Ranking ---------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Bid Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {rankedBids.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead className="text-right">Bid Price</TableHead>
                    <TableHead className="w-32">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankedBids.map((bid) => (
                    <TableRow
                      key={bid.id}
                      className={`${
                        bid.rank === 1
                          ? "border-l-4 border-success bg-green-50/40"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          #{bid.rank}
                          {bid.rank === 1 && <Trophy className="w-4 h-4 text-success" />}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{bid.contractor}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatPrice(bid.price)}
                      </TableCell>
                      <TableCell>{getStatusBadge(bid.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-neutral-400 italic">No bids yet. Be the first to place one!</p>
            )}
          </CardContent>
        </Card>

        {/* ---------------- My Bid ---------------- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Bid</CardTitle>
          </CardHeader>
          <CardContent>
            {hasBid && myBid ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Current Bid Amount</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPrice(myBid)}</p>
                </div>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  Edit Bid
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4">You haven’t placed a bid yet</p>
                <Button className="bg-primary hover:bg-[#c50010]">Place My Bid</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
