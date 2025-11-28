import React, { useState, useEffect } from 'react';
import '@/styles/TradesChat.css';
import { X } from 'lucide-react';

interface PersonalizationData {
    investmentGoal: string;
    riskTolerance: string;
    timeHorizon: string;
    preferredSectors: string[];
    tradingFrequency: string;
    assetClasses: string[];
    regionalFocus: string;
    analysisStyle: string;
    experienceLevel: string;
    notificationPreference: string;
    [key: string]: any;
}

interface PersonalizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: PersonalizationData;
    onSave?: (data: PersonalizationData) => void;
}

const PersonalizationModal: React.FC<PersonalizationModalProps> = ({ isOpen, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState<PersonalizationData>({
        investmentGoal: '',
        riskTolerance: '',
        timeHorizon: '',
        preferredSectors: [],
        tradingFrequency: '',
        assetClasses: [],
        regionalFocus: '',
        analysisStyle: '',
        experienceLevel: '',
        notificationPreference: '',
        ...initialData // Merge initial data if provided
    });

    // Update local state when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    // Handle closing animation
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300); // Match CSS animation duration
    };

    if (!isOpen && !isClosing) return null;

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelect = (field: string, value: string) => {
        setFormData(prev => {
            const current = prev[field] as string[];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Personalization Data:', formData);
        if (onSave) {
            onSave(formData);
        }
        handleClose();
    };

    // Helper for Card Selection
    const SelectionCard = ({ label, selected, onClick, multi = false }: { label: string, selected: boolean, onClick: () => void, multi?: boolean }) => (
        <div
            className={`selection-card ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="card-indicator">
                {selected && (multi ? '✓' : '●')}
            </div>
            <span>{label}</span>
        </div>
    );

    return (
        <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
            <div className={`modal-content ${isClosing ? 'closing' : ''}`}>
                <button className="modal-close" onClick={handleClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <h2>Personalize Your Experience</h2>
                    <p>Tailor the market intelligence to your unique trading style.</p>
                </div>

                <form onSubmit={handleSubmit} className="personalization-form">

                    {/* Question 1: Investment Goal */}
                    <div className="form-group">
                        <label>1. What is your primary investment goal?</label>
                        <div className="cards-grid">
                            {[
                                { val: 'growth', label: 'Capital Growth' },
                                { val: 'income', label: 'Income Generation' },
                                { val: 'preservation', label: 'Capital Preservation' },
                                { val: 'speculation', label: 'Speculation / Trading' }
                            ].map(opt => (
                                <SelectionCard
                                    key={opt.val}
                                    label={opt.label}
                                    selected={formData.investmentGoal === opt.val}
                                    onClick={() => handleChange('investmentGoal', opt.val)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 2: Risk Tolerance */}
                    <div className="form-group">
                        <label>2. What is your risk tolerance?</label>
                        <div className="cards-grid">
                            {['Low', 'Medium', 'High', 'Very High'].map(opt => (
                                <SelectionCard
                                    key={opt}
                                    label={opt}
                                    selected={formData.riskTolerance === opt}
                                    onClick={() => handleChange('riskTolerance', opt)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 3: Time Horizon */}
                    <div className="form-group">
                        <label>3. What is your time horizon?</label>
                        <div className="cards-grid">
                            {[
                                { val: 'short', label: 'Short-term (Days)' },
                                { val: 'medium', label: 'Medium-term (Months)' },
                                { val: 'long', label: 'Long-term (Years)' }
                            ].map(opt => (
                                <SelectionCard
                                    key={opt.val}
                                    label={opt.label}
                                    selected={formData.timeHorizon === opt.val}
                                    onClick={() => handleChange('timeHorizon', opt.val)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 4: Preferred Sectors */}
                    <div className="form-group">
                        <label>4. Preferred Sectors (Select multiple)</label>
                        <div className="cards-grid">
                            {['Tech', 'Finance', 'Healthcare', 'Energy', 'Consumer'].map(opt => (
                                <SelectionCard
                                    key={opt}
                                    label={opt}
                                    multi={true}
                                    selected={formData.preferredSectors.includes(opt)}
                                    onClick={() => handleMultiSelect('preferredSectors', opt)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 5: Trading Frequency */}
                    <div className="form-group">
                        <label>5. How frequently do you trade?</label>
                        <div className="cards-grid">
                            {['Daily', 'Weekly', 'Monthly', 'Rarely'].map(opt => (
                                <SelectionCard
                                    key={opt}
                                    label={opt}
                                    selected={formData.tradingFrequency === opt}
                                    onClick={() => handleChange('tradingFrequency', opt)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 6: Asset Classes */}
                    <div className="form-group">
                        <label>6. Asset Classes of Interest</label>
                        <div className="cards-grid">
                            {['Stocks', 'Crypto', 'Forex', 'Commodities', 'ETFs'].map(opt => (
                                <SelectionCard
                                    key={opt}
                                    label={opt}
                                    multi={true}
                                    selected={formData.assetClasses.includes(opt)}
                                    onClick={() => handleMultiSelect('assetClasses', opt)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 7: Regional Focus */}
                    <div className="form-group">
                        <label>7. Regional Focus</label>
                        <div className="cards-grid">
                            {[
                                { val: 'us', label: 'US Markets' },
                                { val: 'eu', label: 'European Markets' },
                                { val: 'asia', label: 'Asian Markets' },
                                { val: 'global', label: 'Global' }
                            ].map(opt => (
                                <SelectionCard
                                    key={opt.val}
                                    label={opt.label}
                                    selected={formData.regionalFocus === opt.val}
                                    onClick={() => handleChange('regionalFocus', opt.val)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 8: Analysis Style */}
                    <div className="form-group">
                        <label>8. Preferred Analysis Style</label>
                        <div className="cards-grid">
                            {['Technical', 'Fundamental', 'Both'].map(opt => (
                                <SelectionCard
                                    key={opt}
                                    label={opt}
                                    selected={formData.analysisStyle === opt}
                                    onClick={() => handleChange('analysisStyle', opt)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 9: Experience Level */}
                    <div className="form-group">
                        <label>9. Experience Level</label>
                        <div className="cards-grid">
                            {['Beginner', 'Intermediate', 'Advanced', 'Pro'].map(opt => (
                                <SelectionCard
                                    key={opt}
                                    label={opt}
                                    selected={formData.experienceLevel === opt}
                                    onClick={() => handleChange('experienceLevel', opt)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Question 10: Notification Preference */}
                    <div className="form-group">
                        <label>10. Notification Preference</label>
                        <div className="cards-grid">
                            {['Email', 'In-App', 'None'].map(opt => (
                                <SelectionCard
                                    key={opt}
                                    label={opt}
                                    selected={formData.notificationPreference === opt}
                                    onClick={() => handleChange('notificationPreference', opt)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose}>Cancel</button>
                        <button type="submit" className="btn-submit">Save Preferences</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PersonalizationModal;
