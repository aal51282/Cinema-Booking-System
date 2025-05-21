"use client"

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Edit2, Star, Calendar, Clock, Plus, Trash2, RefreshCw } from 'lucide-react';

import { Movie, User, MovieFilter, Promotion, AccountStatus } from '@/util/types'
import { deleteMovie, getMovies } from '@/services/movieAPI';
import { useAuth } from '@/components/custom/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getUsers, updateUserAccountStatus, updateUserAdminStatus } from '@/services/userAPI'
import MovieEditorButton from '@/components/custom/MovieEditor'
import { ConfirmationDialog } from '@/components/custom/ConfirmationDialog'
import { getPromotions, createPromotion, deletePromotion } from '@/services/promotionAPI';
import { cn } from '@/lib/utils'

// Example bookings data
const bookings = [
    { id: 1, movieId: 1, theaterNumber: 1, showingDate: new Date("2024-10-01T14:00:00"), userId: 1 },
    { id: 2, movieId: 2, theaterNumber: 2, showingDate: new Date("2024-09-28T18:00:00"), userId: 2 },
    { id: 3, movieId: 3, theaterNumber: 3, showingDate: new Date("2024-09-25T22:00:00"), userId: 3 },
    { id: 4, movieId: 4, theaterNumber: 1, showingDate: new Date("2024-09-30T20:00:00"), userId: 1 },
    { id: 5, movieId: 5, theaterNumber: 2, showingDate: new Date("2024-09-22T17:00:00"), userId: 2 },
]

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState("movies")
    const [searchTerm, setSearchTerm] = useState("")
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
    const [movies, setMovies] = useState<Movie[]>([])
    const [users, setUsers] = useState<User[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [editingPromotion, setEditingPromotion] = useState<Partial<Promotion> | null>(null);
    
    const [loadingUserStatus, setLoadingUserStatus] = useState<number | null>(null);
    const [loadingAdminStatus, setLoadingAdminStatus] = useState<number | null>(null);

    const {user} = useAuth();
    const nav = useNavigate();

    const handleSearch = async (query?:string) => {
        setSearchTerm(query || "");
        if (activeTab === "movies") {
            let fetchedMovies:Movie[] = [];
            let filters:MovieFilter = {};
            if(query) filters.title = query;
            fetchedMovies = await getMovies(filters);
            setMovies(fetchedMovies);
        } else if (activeTab === "promotions") {
            // setPromotions(promotionsData.filter(promotion =>
            //     promotion.title.toLowerCase().includes(query.toLowerCase()) ||
            //     promotion.description.toLowerCase().includes(query.toLowerCase())
            // ))
        }
    }

    const setUserStatus = async (userId: number, status: AccountStatus) => {
        setLoadingUserStatus(userId);
        try {
            await updateUserAccountStatus(userId, status);
            setUsers(await getUsers());
        } catch (error) {
            console.error('Error setting user status:', error);
        } finally {
            setLoadingUserStatus(null);
        }
    }

    const setUserAdminStatus = async (userId: number, isAdmin: boolean) => {
        setLoadingAdminStatus(userId);
        try {
            await updateUserAdminStatus(userId, isAdmin);
            setUsers(await getUsers());
        } catch (error) {
            console.error('Error setting user admin status:', error);
        } finally {
            setLoadingAdminStatus(null);
        }
    }

    const filteredUsers = users.filter(user =>
        (user.firstName + " " + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredBookings = bookings.filter(booking =>
        movies.find(movie => movie.id === booking.movieId)?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.theaterNumber.toString().includes(searchTerm)
    )

    const filteredPromotions = promotions.filter(promotion =>
        promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchPromotions = async () => {
        try {
            const data = await getPromotions();
            setPromotions(data);
        } catch (error) {
            console.error('Error fetching promotions:', error);
        }
    };

    const handleSavePromotion = async (promotion: Partial<Promotion>) => {
        try {
            await createPromotion(promotion);
            setEditingPromotion(null);
            fetchPromotions(); // Refresh the list
        } catch (error) {
            console.error('Error saving promotion:', error);
        }
    };

    const handleDeletePromotion = async (promotionId: number) => {
        try {
            await deletePromotion(promotionId);
            fetchPromotions(); // Refresh the list
        } catch (error) {
            console.error('Error deleting promotion:', error);
        }
    };

    useEffect(() => {
        if(!user?.isAdmin) nav('/login');
        (async () => {
            await handleSearch();
            await fetchPromotions();
        })();
        (async () => {
            const tempUsers = await getUsers();
            console.log(tempUsers)
            setUsers(tempUsers);
        })();
    }, [])

    return (user?.isAdmin ? 
        <div className="min-h-screen bg-black text-white p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <Tabs orientation='vertical' value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-darkgray-800">
                    <TabsTrigger value="movies" className="data-[state=active]:bg-darkgray-700 data-[state=active]:text-white">Manage Movies</TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-darkgray-700 data-[state=active]:text-white">Manage Users</TabsTrigger>
                    <TabsTrigger value="promotions" className="data-[state=active]:bg-darkgray-700 data-[state=active]:text-white">Manage Promotions</TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-2 mb-4">
                    <Search className="text-darkgray-300" />
                    <Input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => {handleSearch(e.target.value)}}
                        className="bg-darkgray-700 text-white border-darkgray-600"
                    />
                </div>
                <TabsContent value="movies" className="space-y-4">
                    <MovieEditorButton refreshList={() => {setMovies([]); handleSearch()}}/>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-white">Title</TableHead>
                                <TableHead className="text-white">Category</TableHead>
                                <TableHead className="text-white">Rating</TableHead>
                                <TableHead className="text-white">Soonest Show</TableHead>
                                <TableHead className="text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movies.map(movie => { 
                                const show = movie.soonestShow && new Date(movie.soonestShow);
                                const dateString = show && show.toLocaleDateString('en-US', {
                                    year: '2-digit',
                                    month: '2-digit',
                                    day: '2-digit',
                                  });
                                  
                                  const timeString = show && show.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false, 
                                  });
                                return (
                                <TableRow key={movie.id}>
                                    <TableCell>{movie.title}</TableCell>
                                    <TableCell>{movie.category}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                            {movie.reviews.reduce((acc, review) => acc + review.rating, 0) / movie.reviews.length}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {dateString ? <div className="flex items-center text-sm">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {dateString}
                                            <Clock className="w-4 h-4 ml-2 mr-1" />
                                            {timeString}
                                        </div>: <div className="flex items-center text-sm">
                                            No Show
                                        </div>}
                                    </TableCell>
                                    <TableCell>
                                        <MovieEditorButton movieId={movie.id} refreshList={() => handleSearch()}/>
                                        <ConfirmationDialog
                                            className='ml-2'
                                            onConfirm={() => {
                                                deleteMovie(movie.id)
                                                handleSearch()
                                            }}
                                            triggerLabel='Delete'
                                            title={`Are you sure you want to delete ${movie.title}`}
                                        >
                                            <p>This action cannot be undone!</p>
                                        </ConfirmationDialog>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="users" className="space-y-4">
                    <Table className='w-full'>
                        <TableHeader>
                            <TableRow className="space-x-8">
                                <TableHead className="text-white">User ID</TableHead>
                                <TableHead className="text-white">Name</TableHead>
                                <TableHead className="text-white">Email</TableHead>
                                <TableHead className="text-white">Status</TableHead>
                                <TableHead className="text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(filteredUser => (
                                <TableRow key={filteredUser.userId} className="space-x-8">
                                    <TableCell>{filteredUser.userId}</TableCell>
                                    <TableCell>{filteredUser.firstName + " " + filteredUser.lastName}</TableCell>
                                    <TableCell>{filteredUser.email}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={`${filteredUser.accountStatus != "Active" ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'} text-white`}
                                            >
                                            {filteredUser.accountStatus}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={filteredUser.userId !== user.userId ? (`${filteredUser.accountStatus == "Active" ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'} text-white`) : `bg-muted text-muted-foreground`}
                                            onClick={() => filteredUser.userId !== user.userId && setUserStatus(filteredUser.userId, filteredUser.accountStatus == AccountStatus.Active ? AccountStatus.Inactive : AccountStatus.Active)}
                                            disabled={filteredUser.userId === user.userId || loadingUserStatus === filteredUser.userId}
                                        >
                                            {loadingUserStatus === filteredUser.userId ? 'Loading...' : (filteredUser.accountStatus == "Active" ? 'Suspend' : 'Activate')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn("ml-2", filteredUser.userId === user.userId && `bg-muted text-muted-foreground`)}
                                            onClick={() => setUserAdminStatus(filteredUser.userId, !filteredUser.isAdmin)}
                                            disabled={filteredUser.userId === user.userId || loadingAdminStatus === filteredUser.userId}
                                        >
                                            {loadingAdminStatus === filteredUser.userId ? 'Loading...' : (filteredUser.isAdmin ? 'Revoke Admin' : 'Promote User')}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="promotions" className="space-y-4">
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant="outline"
                            // size="sm"
                            // className="bg-darkgray-700 text-white hover:bg-darkgray-600"
                            onClick={() => setEditingPromotion({
                                title: '',
                                description: '',
                                discountPercentage: 0,
                                sendTime: '10:00:00'
                            })}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Promotion
                        </Button>
                        <Button
                            variant="outline"
                            // size="sm"
                            // className="bg-darkgray-700 text-white hover:bg-darkgray-600"
                            onClick={() => {
                                setPromotions([]);
                                fetchPromotions();
                            }}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh List
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-white">Title</TableHead>
                                <TableHead className="text-white">Description</TableHead>
                                <TableHead className="text-white">Discount</TableHead>
                                <TableHead className="text-white">Send Time</TableHead>
                                <TableHead className="text-white">Status</TableHead>
                                {/* <TableHead className="text-white">Actions</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPromotions.map(promotion => (
                                <TableRow key={promotion.promotionId}>
                                    <TableCell>{promotion.title}</TableCell>
                                    <TableCell>{promotion.description}</TableCell>
                                    <TableCell>{promotion.discountPercentage}%</TableCell>
                                    <TableCell>{promotion.sendTime}</TableCell>
                                    <TableCell>
                                        <Badge className={`${promotion.isSent ? 'bg-green-700' : 'bg-blue-700'}`}>
                                            {promotion.isSent ? 'Sent' : 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    {/* <TableCell>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn("bg-red-700 text-white hover:bg-red-800", promotion.isSent && `bg-muted text-muted-foreground hover-bg-muted`)}
                                            onClick={() => handleDeletePromotion(promotion.promotionId)}
                                            disabled={promotion.isSent}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
            <Dialog open={!!editingPromotion} onOpenChange={() => setEditingPromotion(null)}>
                <DialogContent className="bg-darkgray-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Add Promotion</DialogTitle>
                    </DialogHeader>
                    {!editingPromotion?.isSent ? (
                        <>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="title" className="text-right">Title</label>
                                    <Input
                                        id="title"
                                        value={editingPromotion?.title || ''}
                                        onChange={(e) => setEditingPromotion(prev => ({ ...prev, title: e.target.value }))}
                                        className="col-span-3 bg-darkgray-700 text-white border-darkgray-600"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="description" className="text-right">Description</label>
                                    <Input
                                        id="description"
                                        value={editingPromotion?.description || ''}
                                        onChange={(e) => setEditingPromotion(prev => ({ ...prev, description: e.target.value }))}
                                        className="col-span-3 bg-darkgray-700 text-white border-darkgray-600"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="discount" className="text-right">Discount %</label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editingPromotion?.discountPercentage || 0}
                                        onChange={(e) => setEditingPromotion(prev => ({ ...prev, discountPercentage: Number(e.target.value) }))}
                                        className="col-span-3 bg-darkgray-700 text-white border-darkgray-600"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="sendTime" className="text-right">Send Time</label>
                                    <Input
                                        id="sendTime"
                                        type="time"
                                        value={editingPromotion?.sendTime || '10:00'}
                                        onChange={(e) => setEditingPromotion(prev => ({ ...prev, sendTime: e.target.value }))}
                                        className="col-span-3 bg-darkgray-700 text-white border-darkgray-600"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingPromotion(null)}
                                    className="bg-darkgray-700 text-white hover:bg-darkgray-600"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingPromotion(prev => ({ ...prev, isSent: true }))}
                                    className="bg-green-700 text-white hover:bg-green-800"
                                >
                                    Review
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4 py-4">
                                <div className="bg-darkgray-700 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">Please review the promotion details:</h3>
                                    <div className="space-y-2">
                                        <p><span className="font-semibold">Title:</span> {editingPromotion.title}</p>
                                        <p><span className="font-semibold">Description:</span> {editingPromotion.description}</p>
                                        <p><span className="font-semibold">Discount:</span> {editingPromotion.discountPercentage}%</p>
                                        <p><span className="font-semibold">Send Time:</span> {editingPromotion.sendTime}</p>
                                    </div>
                                </div>
                                <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-lg">
                                    <p className="text-yellow-400">⚠️ Warning: This action cannot be undone. Once created, the promotion will be automatically sent to all subscribed users at the specified time.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingPromotion(prev => ({ ...prev, isSent: false }))}
                                    className="bg-darkgray-700 text-white hover:bg-darkgray-600"
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleSavePromotion(editingPromotion)}
                                    className="bg-red-700 text-white hover:bg-red-800"
                                >
                                    Confirm & Create
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>: <></>
    );
}