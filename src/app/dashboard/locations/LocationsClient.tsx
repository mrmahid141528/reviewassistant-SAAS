"use client"

import { useState } from "react"
import { addBusinessLocation, deleteBusinessLocation } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Plus, Trash2, ExternalLink } from "lucide-react"

type LocationClientProps = {
    locations: any[];
    maxLocations: number;
    currentCount: number;
    businessSlug: string;
}

export default function LocationsClient({ locations, maxLocations, currentCount, businessSlug }: LocationClientProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isMaxedOut = currentCount >= maxLocations;

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            await addBusinessLocation(formData);
            setOpen(false);
        } catch (err: any) {
            setError(err.message || "Failed to add location");
        } finally {
            setLoading(false);
        }
    }

    const onDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this location? This cannot be undone.")) return;
        try {
            await deleteBusinessLocation(id);
        } catch (err: any) {
            alert(err.message);
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Business Locations</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your physical store locations and direct review traffic dynamically.
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger render={<Button disabled={isMaxedOut} className="gap-2 shrink-0" />}>
                        <Plus className="h-4 w-4" />
                        Add Location
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Branch</DialogTitle>
                            <DialogDescription>
                                Create a distinct location to route customers towards specific Google Place IDs.
                            </DialogDescription>
                        </DialogHeader>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Location Name / Branch</Label>
                                <Input id="name" name="name" placeholder="e.g. Downtown Office" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Physical Address</Label>
                                <Input id="address" name="address" placeholder="123 Main St, NY" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="googlePlaceId">Google Place ID (Optional)</Label>
                                <Input id="googlePlaceId" name="googlePlaceId" placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4" />
                                <p className="text-xs text-muted-foreground mt-1">If blank, utilizes the global Business Review Link.</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Saving..." : "Save Location"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50/80 p-4 border-b flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                    <span className={`text-sm font-bold ${isMaxedOut ? 'text-red-600' : 'text-blue-600'}`}>
                        {currentCount} / {maxLocations} Locations
                    </span>
                </div>

                <div className="divide-y">
                    {locations.length > 0 ? (
                        locations.map((loc) => (
                            <div key={loc.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:bg-gray-50/50 transition-colors">
                                <div className="flex gap-4 items-start sm:items-center">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-1 sm:mt-0">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{loc.address}</p>
                                        <div className="flex gap-4 mt-2">
                                            {loc.googlePlaceId && (
                                                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    ID: {loc.googlePlaceId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 sm:mt-0 self-end sm:self-auto shrink-0">
                                    <a
                                        href={`/review/${businessSlug}?locationId=${loc.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Test Review Link"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                    <button
                                        onClick={() => onDelete(loc.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete Location"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 pl-6 text-center text-gray-500">
                            <MapPin className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-900">No locations added yet</p>
                            <p className="text-sm mt-1">Start by adding your first designated branch.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
