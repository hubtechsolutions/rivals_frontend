"use client";

import { X, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DeleteCompetitorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    brandName: string;
}

export default function DeleteCompetitorModal({ isOpen, onClose, onConfirm, isLoading, brandName }: DeleteCompetitorModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
                        onClick={() => !isLoading && onClose()}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-101 w-full max-w-md"
                    >
                        <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="relative px-6 py-5 border-b border-border">
                                <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                                            <AlertTriangle className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground">
                                                Delete Competitor
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="h-5 w-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    Are you sure you want to delete <span className="font-semibold text-foreground">{brandName}</span>? This will hide all associated social, website, and review data.
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-3 justify-end mt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
