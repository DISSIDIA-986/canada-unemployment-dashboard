import {useState} from 'react';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    // 图片查看器状态
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImage, setViewerImage] = useState({url: '', alt: ''});

    // 打开图片查看器的函数
    const openImageViewer = (url, alt) => {
        setViewerImage({url, alt});
        setViewerOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-blue-800 text-white shadow-md">
                <div className="container mx-auto px-4 py-5">
                    <h1 className="text-2xl font-bold">Canadian Employment Insights Dashboard</h1>
                    <p className="text-blue-100 mt-1">Comprehensive analysis of unemployment trends, job vacancies, and
                        career opportunities</p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-1 overflow-x-auto">
                        <TabButton active={activeTab === 'overview'}
                                   onClick={() => setActiveTab('overview')}>Overview</TabButton>
                        <TabButton active={activeTab === 'unemployment'} onClick={() => setActiveTab('unemployment')}>Unemployment
                            Trends</TabButton>
                        <TabButton active={activeTab === 'education'} onClick={() => setActiveTab('education')}>Education
                            Impact</TabButton>
                        <TabButton active={activeTab === 'regional'} onClick={() => setActiveTab('regional')}>Regional
                            Analysis</TabButton>
                        <TabButton active={activeTab === 'demographic'}
                                   onClick={() => setActiveTab('demographic')}>Demographics</TabButton>
                        <TabButton active={activeTab === 'occupation'} onClick={() => setActiveTab('occupation')}>Occupations
                            & Vacancies</TabButton>
                        <TabButton active={activeTab === 'career'} onClick={() => setActiveTab('career')}>Career
                            Advisory</TabButton>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {activeTab === 'overview' && <OverviewPanel openImageViewer={openImageViewer}/>}
                {activeTab === 'unemployment' && <UnemploymentPanel openImageViewer={openImageViewer}/>}
                {activeTab === 'education' && <EducationPanel openImageViewer={openImageViewer}/>}
                {activeTab === 'regional' && <RegionalPanel openImageViewer={openImageViewer}/>}
                {activeTab === 'demographic' && <DemographicPanel openImageViewer={openImageViewer}/>}
                {activeTab === 'occupation' && <OccupationPanel openImageViewer={openImageViewer}/>}
                {activeTab === 'career' && <CareerPanel openImageViewer={openImageViewer}/>}
            </main>

            <footer className="bg-gray-100 border-t mt-8 py-4">
                <div className="container mx-auto px-4 text-sm text-gray-600">
                    <p>Data Source: Statistics Canada, 2025</p>
                    <p className="mt-1">Last Updated: April 2025</p>
                </div>
            </footer>

            {/* 图片查看器模态框 */}
            <ImageViewer
                isOpen={viewerOpen}
                imageUrl={viewerImage.url}
                alt={viewerImage.alt}
                onClose={() => setViewerOpen(false)}
            />
        </div>
    );
};

// 图片查看器组件
const ImageViewer = ({isOpen, imageUrl, alt, onClose}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
            onClick={onClose}
        >
            <div
                className="max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">{alt || 'Image Preview'}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="bg-gray-100 p-4 flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt={alt || 'Full size image'}
                        className="max-w-full max-h-[70vh] object-contain"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
                        }}
                    />
                </div>
                <div className="p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Tab Button Component
const TabButton = ({children, active, onClick}) => (
    <button
        className={`py-4 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
            active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
        onClick={onClick}
    >
        {children}
    </button>
);

// Reusable Card Component
const Card = ({title, children, className = ""}) => (
    <div className={`bg-white rounded-lg shadow p-5 ${className}`}>
        {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
        {children}
    </div>
);

// 可点击放大的图片组件
const ZoomableImage = ({src, alt, className, openImageViewer}) => (
    <div className="relative group cursor-pointer" onClick={() => openImageViewer(src, alt)}>
        <img
            src={src}
            alt={alt}
            className={`${className} transition-transform group-hover:scale-105`}
            onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
            }}
        />
        <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-500 bg-opacity-75 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6"/>
                </svg>
            </div>
        </div>
    </div>
);

// Image Card Component
const ImageCard = ({title, description, imageName, openImageViewer}) => {
    const imageUrl = `https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/${imageName}`;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden h-full flex flex-col">
            <div className="p-4 bg-gray-50 flex-1 cursor-pointer" onClick={() => openImageViewer(imageUrl, title)}>
                <div className="relative group">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-48 object-contain transition-transform group-hover:scale-105"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                        }}
                    />
                    <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-blue-500 bg-opacity-70 text-white p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-3H6"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-medium">{title}</h3>
                {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
        </div>
    );
};

// Stat Box Component
const StatBox = ({title, value, trend, description}) => {
    let trendColor = "text-gray-500";
    let trendIcon = "→";

    if (trend === "up") {
        trendColor = "text-red-500";
        trendIcon = "↑";
    } else if (trend === "down") {
        trendColor = "text-green-500";
        trendIcon = "↓";
    }

    return (
        <div className="bg-white rounded-lg shadow p-5">
            <div className="text-sm font-medium text-gray-500 truncate">
                {title}
            </div>
            <div className="mt-1 flex items-baseline">
                <div className="text-2xl font-semibold">{value}</div>
                {trend && (
                    <span className={`ml-2 ${trendColor}`}>
            {trendIcon}
          </span>
                )}
            </div>
            {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
        </div>
    );
};

// Overview Panel
const OverviewPanel = ({openImageViewer}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Canadian Employment Snapshot</h2>
                <p className="text-gray-700 mb-3">
                    Canada's labor market has stabilized post-pandemic, with unemployment near historic lows at 6.6% as
                    of February 2025. However, structural and frictional unemployment remain concentrated among youth,
                    low-educated individuals, and certain regions.
                </p>
                <p className="text-gray-700 mb-3">
                    High-skilled, high-wage professions show low unemployment and stability during downturns, while
                    low-skilled sectors face higher volatility. There are persistent regional disparities, with Western
                    provinces maintaining lower unemployment rates than Atlantic provinces.
                </p>
                <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full bg-blue-600 mr-1"></span>
                        <span>Latest data: April 2025</span>
                    </div>
                    <button className="text-blue-600 text-sm font-medium">View Full Report</button>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <StatBox
                        title="National Unemployment"
                        value="6.6%"
                        trend="down"
                        description="Near historic lows"
                    />
                    <StatBox
                        title="Job Vacancies"
                        value="439,590"
                        trend="down"
                        description="2.5% vacancy rate"
                    />
                    <StatBox
                        title="Highest Provincial Rate"
                        value="11.0%"
                        description="Newfoundland & Labrador"
                    />
                    <StatBox
                        title="Lowest Provincial Rate"
                        value="5.6%"
                        description="British Columbia"
                    />
                </div>
                <Card>
                    <h3 className="font-medium mb-2">Key Insights</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Education is the strongest predictor of employment stability</span>
                        </li>
                        <li className="flex">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Youth (15-24) face the highest unemployment rates (3x higher than adults)</span>
                        </li>
                        <li className="flex">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Gender differences in unemployment are minimal and transient</span>
                        </li>
                        <li className="flex">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>High vacancies in healthcare, tech, and skilled trades</span>
                        </li>
                    </ul>
                </Card>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageCard
                title="National Unemployment Trend"
                description="Historical unemployment rates for Canada"
                imageName="canada_unemployment.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Education Impact"
                description="How education levels affect unemployment rates"
                imageName="unemployment_by_Education_impact.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Regional Disparities"
                description="Unemployment rates by province"
                imageName="province_comparison.png"
                openImageViewer={openImageViewer}
            />
        </div>

        <Card>
            <h2 className="text-xl font-bold mb-4">Key Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Youth Support</h3>
                    <p className="text-sm text-gray-600">Expand internships, apprenticeships, and tax incentives for
                        hiring youth.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Education & Upskilling</h3>
                    <p className="text-sm text-gray-600">Prioritize adult education and vocational training aligned with
                        high-demand sectors.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Regional Development</h3>
                    <p className="text-sm text-gray-600">Invest in high-unemployment regions and facilitate
                        interprovincial labor mobility.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Labor Market Matching</h3>
                    <p className="text-sm text-gray-600">Deploy AI-driven platforms to connect job seekers with
                        vacancies and address skill gaps.</p>
                </div>
            </div>
        </Card>
    </div>
);

// Unemployment Trends Panel
const UnemploymentPanel = ({openImageViewer}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">Unemployment Forecast</h2>
                <div className="aspect-video bg-gray-50 rounded flex items-center justify-center">
                    <ZoomableImage
                        src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/unemployment_forecast_overall.png"
                        alt="Overall Unemployment Forecast"
                        className="max-w-full max-h-full"
                        openImageViewer={openImageViewer}
                    />
                </div>
                <p className="mt-4 text-gray-700">
                    Canada's national unemployment rate is projected to remain near historic lows (around 6.4%) over the
                    next 12 months, with modest seasonal fluctuations. The forecast shows stability in the overall labor
                    market.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Provincial Forecasts</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">British Columbia</span>
                        <span className="text-green-600 font-medium">5.6%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '56%'}}></div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Alberta</span>
                        <span className="text-yellow-600 font-medium">8.1%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '81%'}}></div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Canada (National)</span>
                        <span className="text-blue-600 font-medium">6.4%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '64%'}}></div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Newfoundland & Labrador</span>
                        <span className="text-red-600 font-medium">11.0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="font-medium">Prince Edward Island</span>
                        <span className="text-orange-600 font-medium">7.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '78%'}}></div>
                    </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    Forecasted average unemployment rates for the next 12 months
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImageCard
                title="Provincial Forecast Comparison"
                description="Side-by-side comparison of provincial unemployment forecasts"
                imageName="province_forecast_comparison.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="British Columbia Forecast"
                description="Projected to maintain the lowest unemployment rate"
                imageName="unemployment_forecast_british_columbia.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Alberta Forecast"
                description="Expected to improve gradually from oil price shocks"
                imageName="unemployment_forecast_alberta.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Canada National Forecast"
                description="Projected to remain near historic lows"
                imageName="unemployment_forecast_canada.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Newfoundland & Labrador Forecast"
                description="Projected to remain highest nationally"
                imageName="unemployment_forecast_newfoundland_and_labrador.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Prince Edward Island Forecast"
                description="Shows strong seasonal tourism-driven fluctuations"
                imageName="unemployment_forecast_prince_edward_island.png"
                openImageViewer={openImageViewer}
            />
        </div>

        <Card>
            <h2 className="text-xl font-bold mb-4">Unemployment Risk Factors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <ZoomableImage
                        src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/unemployment_feature_mdi_ranking.png"
                        alt="Feature Importance"
                        className="w-full"
                        openImageViewer={openImageViewer}
                    />
                </div>
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Our predictive models identify the most critical factors affecting unemployment risk. Age,
                        education level, and geographic location emerge as the strongest predictors.
                    </p>
                    <div className="space-y-2">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Age (15-24 years)</span>
                                <span className="font-medium">43.5%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: '43.5%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Education (Some high school)</span>
                                <span className="font-medium">35.1%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: '35.1%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Location (Atlantic provinces)</span>
                                <span className="font-medium">26.5%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: '26.5%'}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Gender</span>
                                <span className="font-medium">1.1%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{width: '1.1%'}}></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        Gender has minimal importance, suggesting that youth, low education, and regional economic
                        conditions are key risk factors.
                    </p>
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageCard
                title="Risk Score Distribution"
                description="Distribution of unemployment risk across the population"
                imageName="risk_score_distribution.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Factor Correlations"
                description="How different unemployment factors relate to each other"
                imageName="category_correlation_matrix.png"
                openImageViewer={openImageViewer}
            />
        </div>
    </div>
);

// Education Panel
const EducationPanel = ({openImageViewer}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Education Impact on Unemployment</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/unemployment_by_Education_impact.png"
                    alt="Education Impact"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Education is the strongest predictor of unemployment risk. Higher education consistently reduces
                    risks, with university graduates facing minimal unemployment (5.4%). Low-educated groups remain
                    disproportionately vulnerable, even during economic recoveries.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Unemployment Rates by Education</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">University degree</span>
                            <span className="text-sm font-medium">5.4%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">Bachelor's degree</span>
                            <span className="text-sm font-medium">5.4%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">Above bachelor's degree</span>
                            <span className="text-sm font-medium">5.6%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '47%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">Postsecondary certificate or diploma</span>
                            <span className="text-sm font-medium">5.8%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '48%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">High school graduate</span>
                            <span className="text-sm font-medium">8.0%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '67%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">Some postsecondary</span>
                            <span className="text-sm font-medium">8.4%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '70%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm">Some high school</span>
                            <span className="text-sm font-medium">12.0%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                    <span className="text-xs text-gray-500 mr-3">High Risk</span>

                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                    <span className="text-xs text-gray-500 mr-3">Moderate Risk</span>

                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                    <span className="text-xs text-gray-500">Low Risk</span>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageCard
                title="Education Comparison"
                description="Side-by-side comparison of unemployment rates by education"
                imageName="education_comparison.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Education & Age Interaction"
                description="How education and age together influence unemployment"
                imageName="heatmap_educational_attainment_age_group.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Education & Region Interaction"
                description="How education impacts unemployment across regions"
                imageName="interaction_heatmap_Education_GeoName.png"
                openImageViewer={openImageViewer}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Education Level Forecasts</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/education_forecast_comparison.png"
                    alt="Education Forecast Comparison"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Forecasts reveal persistent gaps in unemployment rates by education level. University graduates are
                    projected to maintain the lowest unemployment rates (around 5.4%), largely immune to economic
                    cycles. In contrast, those with some high school education face rates nearly triple that level
                    (12.0%).
                </p>
            </Card>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Key Education Insights</h2>
                    <ul className="space-y-3">
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Each level of education gained provides significant protection against unemployment risk</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Even some post-secondary education reduces unemployment risk by 30% compared to high school only</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>The gap between education levels persists across all provinces, though its magnitude varies</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Education has a stronger protective effect for youth (15-24) than other age groups</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Advanced degrees provide diminishing returns compared to bachelor's degrees in most fields</span>
                        </li>
                    </ul>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4">Policy Recommendations</h2>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <span
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mt-0.5">1</span>
                            <div>
                                <h3 className="font-medium">Expand Adult Education Access</h3>
                                <p className="text-sm text-gray-600">Increase funding for adults returning to complete
                                    high school or post-secondary education</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mt-0.5">2</span>
                            <div>
                                <h3 className="font-medium">Target High-Demand Fields</h3>
                                <p className="text-sm text-gray-600">Align educational programs with sectors
                                    experiencing high vacancy rates</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mt-0.5">3</span>
                            <div>
                                <h3 className="font-medium">Enhance Vocational Training</h3>
                                <p className="text-sm text-gray-600">Invest in skilled trades and technical
                                    certifications to address labor shortages</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
);

// Regional Panel
const RegionalPanel = ({openImageViewer}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">Regional Unemployment Disparities</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/province_comparison.png"
                    alt="Provincial Comparison"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Canada exhibits persistent regional unemployment disparities. Western provinces (e.g., British
                    Columbia) maintain low rates, while Atlantic provinces (e.g., Newfoundland) face chronic high
                    unemployment. These regional disparities persist even after accounting for individual
                    characteristics like education and age.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Regional Impact on Unemployment</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/unemployment_by_GeoName_impact.png"
                    alt="Geographic Impact"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <div className="text-sm text-gray-600">
                    <p>The chart shows how different regions impact unemployment risk, controlling for other factors.
                        Eastern provinces show significantly higher unemployment risk, while Western provinces show
                        lower risk.</p>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Provincial Salary Comparison</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/regional_salary_comparison.png"
                    alt="Regional Salary Comparison"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Regional disparities in average wages are evident. Resource-rich provinces like Alberta have
                    significantly higher wages compared to Atlantic provinces. Regions with higher wages generally
                    exhibit lower unemployment rates, reflecting the influence of economic strength on both income and
                    employment.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Regional Job Vacancies</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/regional_vacancies.png"
                    alt="Regional Vacancies"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Job vacancies are unevenly distributed geographically. Economic and population hubs like Ontario and
                    Western provinces have the highest vacancy counts, whereas remote or economically weaker provinces
                    have fewer openings. This uneven distribution contributes to regional labor market imbalances.
                </p>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageCard
                title="Region & Education Interaction"
                description="How region and education together affect unemployment"
                imageName="interaction_heatmap_Education_GeoName.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Region & Age Interaction"
                description="How region and age together affect unemployment"
                imageName="heatmap_geo_age_group.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Region & Gender Interaction"
                description="How region and gender together affect unemployment"
                imageName="heatmap_geo_gender.png"
                openImageViewer={openImageViewer}
            />
        </div>

        <Card>
            <h2 className="text-xl font-bold mb-4">Regional Development Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Economic Diversification</h3>
                    <p className="text-sm text-gray-600">Invest in diversifying economies in resource-dependent regions
                        to reduce vulnerability to sector-specific shocks.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Infrastructure Investment</h3>
                    <p className="text-sm text-gray-600">Develop transportation and digital infrastructure in
                        high-unemployment regions to improve connectivity.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Regional Tax Incentives</h3>
                    <p className="text-sm text-gray-600">Create targeted tax incentives for businesses establishing
                        operations in high-unemployment regions.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Relocation Support</h3>
                    <p className="text-sm text-gray-600">Offer financial assistance for workers willing to relocate from
                        high to low unemployment regions.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Regional Training Programs</h3>
                    <p className="text-sm text-gray-600">Develop education and training programs tailored to the
                        specific needs of regional labor markets.</p>
                </div>
                <div className="border rounded p-4">
                    <h3 className="font-medium mb-2">Remote Work Hubs</h3>
                    <p className="text-sm text-gray-600">Establish remote work hubs in high-unemployment regions to
                        connect local talent with national job opportunities.</p>
                </div>
            </div>
        </Card>
    </div>
);

// Demographic Panel
const DemographicPanel = ({openImageViewer}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Age Impact on Unemployment</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/unemployment_by_Age_impact.png"
                    alt="Age Impact"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Age strongly influences unemployment risk. Younger individuals (ages 15–24) face the highest
                    unemployment rates, which decline sharply for those aged 30–40 and rise slightly after age 50. Youth
                    unemployment rates are multiple times higher than those for adults (25–54).
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Gender Gap Trends</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/gender_gap_canada_gap.png"
                    alt="Gender Gap Trend"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Gender differences in unemployment are minimal and transient. From 2001 to 2025, Canada's male
                    unemployment rate has been on average 1.4 percentage points higher than female rate. The gender gap
                    fluctuates over time, with males historically having slightly higher rates, but gaps narrow with
                    education and economic recovery.
                </p>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Age Group Comparison</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/age_comparison.png"
                    alt="Age Comparison"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-red-50 p-3 rounded">
                        <div className="text-xl font-bold text-red-600">18.9%</div>
                        <div className="text-sm text-gray-600">Youth (15-24)</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                        <div className="text-xl font-bold text-green-600">5.9%</div>
                        <div className="text-sm text-gray-600">Prime-Age (25-54)</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                        <div className="text-xl font-bold text-yellow-600">6.3%</div>
                        <div className="text-sm text-gray-600">Older (55+)</div>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Gender Comparison</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/gender_gap_canada.png"
                    alt="Gender Gap Overview"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded">
                        <div className="text-xl font-bold text-blue-600">7.1%</div>
                        <div className="text-sm text-gray-600">Male Unemployment</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                        <div className="text-xl font-bold text-purple-600">6.8%</div>
                        <div className="text-sm text-gray-600">Female Unemployment</div>
                    </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Current gap: 0.3 percentage points
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageCard
                title="Age & Education Interaction"
                description="How age and education together affect unemployment"
                imageName="heatmap_educational_attainment_age_group.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Gender & Education Interaction"
                description="How gender and education together affect unemployment"
                imageName="heatmap_educational_attainment_gender.png"
                openImageViewer={openImageViewer}
            />
            <ImageCard
                title="Age & Gender Interaction"
                description="How age and gender together affect unemployment"
                imageName="heatmap_gender_age_group.png"
                openImageViewer={openImageViewer}
            />
        </div>

        <Card>
            <h2 className="text-xl font-bold mb-4">Demographic Insights & Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-medium text-lg mb-3">Youth (15-24)</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>Unemployment rates 3x higher than adults, even during economic growth</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>School-to-work transition remains a significant challenge</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>Higher education significantly reduces risk, but doesn't eliminate it</span>
                        </li>
                    </ul>

                    <h3 className="font-medium text-lg mt-6 mb-3">Recommendations</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Expand youth apprenticeship and internship programs</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Provide tax incentives for employers hiring young workers</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Strengthen career guidance in high schools and colleges</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Develop specialized training for youth in high-demand sectors</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-medium text-lg mb-3">Gender Equality</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Gender gap in unemployment has narrowed significantly</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Sectoral imbalances remain (e.g., male-dominated resource industries)</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Gender differences more pronounced in certain regions</span>
                        </li>
                    </ul>

                    <h3 className="font-medium text-lg mt-6 mb-3">Recommendations</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Support female participation in STEM and trades</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Enhance childcare support to sustain workforce engagement</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Address employment barriers in male-dominated industries</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span>Implement flexible work options to support work-life balance</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Card>
    </div>
);

// Occupation Panel
const OccupationPanel = ({openImageViewer}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Industry Vacancy Rates</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/industry_vacancies.png"
                    alt="Industry Vacancies"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Job vacancy rates vary widely across industries. Sectors such as Health Care (4.0%), Other Services
                    (3.3%), and Accommodation and Food Services (3.1%) show high vacancy rates, indicating strong labor
                    demand. In contrast, traditional industries like Manufacturing (1.8%) and Educational Services
                    (1.3%) have fewer vacancies.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">High-Demand Occupations</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Registered Nurses</span>
                            <span className="font-medium text-red-600">7.2%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>23,400 vacancies</span>
                            <span>Critical shortage</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Transport Truck Drivers</span>
                            <span className="font-medium text-red-600">6.5%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>18,900 vacancies</span>
                            <span>High demand</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{width: '90%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Software Engineers</span>
                            <span className="font-medium text-red-600">5.8%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>12,500 vacancies</span>
                            <span>Tech sector growth</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{width: '81%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Information Systems Analysts</span>
                            <span className="font-medium text-orange-600">4.9%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>9,800 vacancies</span>
                            <span>Strong demand</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '68%'}}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="font-medium">Elementary School Teachers</span>
                            <span className="font-medium text-yellow-600">2.3%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>4,500 vacancies</span>
                            <span>Moderate demand</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '32%'}}></div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Vacancy Trends</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/vacancy_trends.png"
                    alt="Vacancy Trends"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-sm text-gray-600">
                    Total job vacancies surged in recent years, peaking in 2021–2022 as businesses ramped up hiring
                    during economic recovery. While growth has slowed since then, vacancies remain elevated compared to
                    pre-pandemic levels.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Occupation Trends</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/occupation_trends.png"
                    alt="Occupation Trends"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-sm text-gray-600">
                    High-skilled, high-wage professions show strong growth and low unemployment. Technical roles and
                    healthcare occupations are expanding rapidly, while some traditional sectors show stagnation or
                    decline.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Critical Skills</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/occupation_skills.png"
                    alt="Occupation Skills"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-sm">Communication</span>
                        <span className="text-sm font-medium">234 occurrences</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">Problem Solving</span>
                        <span className="text-sm font-medium">198 occurrences</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">Leadership</span>
                        <span className="text-sm font-medium">167 occurrences</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">Programming</span>
                        <span className="text-sm font-medium">145 occurrences</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm">Data Analysis</span>
                        <span className="text-sm font-medium">132 occurrences</span>
                    </div>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">Salary Distribution</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/salary_distribution_analysis.png"
                    alt="Salary Distribution"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    The Canadian salary distribution reveals a bimodal pattern with most jobs paying $20-40 hourly, while a small percentage of extremely high-paying positions (reaching $486,469) significantly skews the mean salary upward to $1,975.
                </p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Occupation Salary Comparison</h2>
                <ZoomableImage
                    src="https://dissidia.oss-cn-beijing.aliyuncs.com/Capstone406/figures/occupation_salary_comparison.png"
                    alt="Occupation Salary Comparison"
                    className="w-full mb-4"
                    openImageViewer={openImageViewer}
                />
                <p className="text-gray-700">
                    Average wage levels differ markedly across occupational categories. High-skilled professions (e.g.,
                    professional occupations) command the highest salaries, while low-skilled roles (e.g., service jobs)
                    have the lowest wages. This inverse relationship between wages and unemployment rates suggests that
                    higher-paying jobs are associated with lower unemployment risks.
                </p>
            </Card>
        </div>

        <Card>
            <h2 className="text-xl font-bold mb-4">Highest Growth Occupations</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                    <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-4 text-left">Occupation</th>
                        <th className="py-3 px-4 text-right">Growth Rate</th>
                        <th className="py-3 px-4 text-right">Demand Score</th>
                        <th className="py-3 px-4 text-right">Median Salary</th>
                        <th className="py-3 px-4 text-left">Trend</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    <tr>
                        <td className="py-3 px-4 font-medium">Registered Nurses</td>
                        <td className="py-3 px-4 text-right">15.2%</td>
                        <td className="py-3 px-4 text-right">92/100</td>
                        <td className="py-3 px-4 text-right">$43.09/hr</td>
                        <td className="py-3 px-4"><span className="text-green-600">Rapid growth</span></td>
                    </tr>
                    <tr>
                        <td className="py-3 px-4 font-medium">Software Engineers</td>
                        <td className="py-3 px-4 text-right">12.5%</td>
                        <td className="py-3 px-4 text-right">85/100</td>
                        <td className="py-3 px-4 text-right">$49.26/hr</td>
                        <td className="py-3 px-4"><span className="text-green-600">Rapid growth</span></td>
                    </tr>
                    <tr>
                        <td className="py-3 px-4 font-medium">Early Childhood Educators</td>
                        <td className="py-3 px-4 text-right">9.5%</td>
                        <td className="py-3 px-4 text-right">68/100</td>
                        <td className="py-3 px-4 text-right">$20.60/hr</td>
                        <td className="py-3 px-4"><span className="text-blue-600">Moderate growth</span></td>
                    </tr>
                    <tr>
                        <td className="py-3 px-4 font-medium">Information Systems Analysts</td>
                        <td className="py-3 px-4 text-right">8.9%</td>
                        <td className="py-3 px-4 text-right">78/100</td>
                        <td className="py-3 px-4 text-right">$43.94/hr</td>
                        <td className="py-3 px-4"><span className="text-blue-600">Moderate growth</span></td>
                    </tr>
                    <tr>
                        <td className="py-3 px-4 font-medium">Transport Truck Drivers</td>
                        <td className="py-3 px-4 text-right">7.8%</td>
                        <td className="py-3 px-4 text-right">72/100</td>
                        <td className="py-3 px-4 text-right">$25.90/hr</td>
                        <td className="py-3 px-4"><span className="text-blue-600">Moderate growth</span></td>
                    </tr>
                    <tr>
                        <td className="py-3 px-4 font-medium">Lawyers</td>
                        <td className="py-3 px-4 text-right">3.4%</td>
                        <td className="py-3 px-4 text-right">60/100</td>
                        <td className="py-3 px-4 text-right">$55.73/hr</td>
                        <td className="py-3 px-4"><span className="text-gray-600">Stable growth</span></td>
                    </tr>
                    <tr>
                        <td className="py-3 px-4 font-medium">Elementary School Teachers</td>
                        <td className="py-3 px-4 text-right">2.3%</td>
                        <td className="py-3 px-4 text-right">45/100</td>
                        <td className="py-3 px-4 text-right">$41.65/hr</td>
                        <td className="py-3 px-4"><span className="text-gray-600">Stable growth</span></td>
                    </tr>
                    <tr>
                        <td className="py-3 px-4 font-medium">Food Service Supervisors</td>
                        <td className="py-3 px-4 text-right">-2.1%</td>
                        <td className="py-3 px-4 text-right">35/100</td>
                        <td className="py-3 px-4 text-right">$17.23/hr</td>
                        <td className="py-3 px-4"><span className="text-red-600">Slight decline</span></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

// Career Advisory Panel
const CareerPanel = ({openImageViewer}) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">Career Outlook Assessment</h2>
                <p className="text-gray-700 mb-4">
                    Based on comprehensive analysis of unemployment trends, job vacancies, and occupational forecasts,
                    we can provide targeted career guidance to help individuals navigate the Canadian job market
                    effectively.
                </p>

                <div className="bg-blue-50 p-4 rounded mb-4">
                    <h3 className="font-medium text-blue-800 mb-2">Key Career Planning Insights</h3>
                    <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Education remains the strongest predictor of employment stability and higher earnings</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Technical skills combined with soft skills like communication yield the best outcomes</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Healthcare, technology, and skilled trades show the strongest growth and demand</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Geographic mobility can significantly improve employment prospects</span>
                        </li>
                    </ul>
                </div>

                <h3 className="font-medium text-lg mb-3">Strategic Recommendation Framework</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="border rounded p-4">
                        <h4 className="font-medium mb-2">For Students & Recent Graduates</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Pursue education in high-demand fields</li>
                            <li>• Develop both technical and soft skills</li>
                            <li>• Gain practical experience through internships</li>
                            <li>• Consider geographic mobility for opportunities</li>
                            <li>• Build professional networks early</li>
                        </ul>
                    </div>
                    <div className="border rounded p-4">
                        <h4 className="font-medium mb-2">For Mid-Career Professionals</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Continuously upskill in emerging technologies</li>
                            <li>• Consider additional certifications in high-growth areas</li>
                            <li>• Develop leadership and management capabilities</li>
                            <li>• Build transferable skills for industry flexibility</li>
                            <li>• Monitor industry trends for proactive career planning</li>
                        </ul>
                    </div>
                    <div className="border rounded p-4">
                        <h4 className="font-medium mb-2">For Career Changers</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Identify transferable skills from current role</li>
                            <li>• Target training for specific skill gaps</li>
                            <li>• Consider bridging programs or certifications</li>
                            <li>• Network in target industries</li>
                            <li>• Look for hybrid roles using existing experience</li>
                        </ul>
                    </div>
                    <div className="border rounded p-4">
                        <h4 className="font-medium mb-2">For Older Workers (55+)</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Emphasize experience and reliability</li>
                            <li>• Update digital skills to remain competitive</li>
                            <li>• Consider mentorship or consulting opportunities</li>
                            <li>• Explore phased retirement options</li>
                            <li>• Leverage professional networks for opportunities</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Career Planning Tools</h2>

                <div className="space-y-4">
                    <div className="border rounded p-4">
                        <h3 className="font-medium mb-2">Employment Risk Calculator</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Estimate your personal unemployment risk based on education, age, location and other
                            factors.
                        </p>
                        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                            Calculate My Risk
                        </button>
                    </div>

                    <div className="border rounded p-4">
                        <h3 className="font-medium mb-2">Salary Estimator</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Get personalized salary estimates based on your qualifications, experience, and location.
                        </p>
                        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                            Estimate Salary
                        </button>
                    </div>

                    <div className="border rounded p-4">
                        <h3 className="font-medium mb-2">Skill Gap Analyzer</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Identify the skills you need to develop for your target career path.
                        </p>
                        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                            Analyze Skills
                        </button>
                    </div>

                    <div className="border rounded p-4">
                        <h3 className="font-medium mb-2">Career Pathway Visualizer</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            See potential career progressions and required steps for advancement.
                        </p>
                        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                            Explore Pathways
                        </button>
                    </div>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-bold mb-4">High-Potential Career Fields</h2>
                <div className="space-y-5">
                    <div>
                        <h3 className="font-medium text-lg">Healthcare</h3>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium">Registered Nurses</div>
                                <div className="text-sm text-gray-600">7.2% vacancy rate</div>
                                <div className="text-sm text-green-600">15.2% growth</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium">Mental Health</div>
                                <div className="text-sm text-gray-600">5.1% vacancy rate</div>
                                <div className="text-sm text-green-600">11.7% growth</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium">Physiotherapists</div>
                                <div className="text-sm text-gray-600">4.8% vacancy rate</div>
                                <div className="text-sm text-green-600">9.3% growth</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="font-medium">Healthcare Techs</div>
                                <div className="text-sm text-gray-600">4.5% vacancy rate</div>
                                <div className="text-sm text-green-600">8.9% growth</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-lg">Technology</h3>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium">Software Engineers</div>
                                <div className="text-sm text-gray-600">5.8% vacancy rate</div>
                                <div className="text-sm text-blue-600">12.5% growth</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium">Data Scientists</div>
                                <div className="text-sm text-gray-600">5.3% vacancy rate</div>
                                <div className="text-sm text-blue-600">10.9% growth</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium">Cybersecurity</div>
                                <div className="text-sm text-gray-600">5.0% vacancy rate</div>
                                <div className="text-sm text-blue-600">14.3% growth</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="font-medium">System Analysts</div>
                                <div className="text-sm text-gray-600">4.9% vacancy rate</div>
                                <div className="text-sm text-blue-600">8.9% growth</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-lg">Skilled Trades</h3>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="bg-yellow-50 p-3 rounded">
                                <div className="font-medium">Truck Drivers</div>
                                <div className="text-sm text-gray-600">6.5% vacancy rate</div>
                                <div className="text-sm text-yellow-600">7.8% growth</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded">
                                <div className="font-medium">Electricians</div>
                                <div className="text-sm text-gray-600">4.2% vacancy rate</div>
                                <div className="text-sm text-yellow-600">6.9% growth</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded">
                                <div className="font-medium">HVAC Techs</div>
                                <div className="text-sm text-gray-600">3.9% vacancy rate</div>
                                <div className="text-sm text-yellow-600">5.4% growth</div>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded">
                                <div className="font-medium">Welders</div>
                                <div className="text-sm text-gray-600">3.7% vacancy rate</div>
                                <div className="text-sm text-yellow-600">4.8% growth</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">Critical Skills for Future Employment</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium">Technical Skills</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="border rounded p-2">
                                <div className="font-medium">Programming</div>
                                <div className="text-xs text-gray-500">Python, JavaScript, SQL</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Data Analysis</div>
                                <div className="text-xs text-gray-500">Statistical analysis, visualization</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Digital Marketing</div>
                                <div className="text-xs text-gray-500">SEO, analytics, social media</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Cloud Computing</div>
                                <div className="text-xs text-gray-500">AWS, Azure, infrastructure</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">AI & Machine Learning</div>
                                <div className="text-xs text-gray-500">Algorithms, implementation</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Healthcare Tech</div>
                                <div className="text-xs text-gray-500">Electronic records, telemedicine</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium">Soft Skills</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="border rounded p-2">
                                <div className="font-medium">Communication</div>
                                <div className="text-xs text-gray-500">234 occurrences in job listings</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Problem Solving</div>
                                <div className="text-xs text-gray-500">198 occurrences in job listings</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Leadership</div>
                                <div className="text-xs text-gray-500">167 occurrences in job listings</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Critical Thinking</div>
                                <div className="text-xs text-gray-500">118 occurrences in job listings</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Teamwork</div>
                                <div className="text-xs text-gray-500">112 occurrences in job listings</div>
                            </div>
                            <div className="border rounded p-2">
                                <div className="font-medium">Creativity</div>
                                <div className="text-xs text-gray-500">98 occurrences in job listings</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div>
                            <div>Above bachelor's degree</div>
                            <div>4.7% unemployment rate</div>
                        </div>
                        <div>
                            <div>University degree</div>
                            <div>4.8% unemployment rate</div>
                        </div>
                        <div>
                            <div>Bachelor's degree</div>
                            <div>5.1% unemployment rate</div>
                        </div>
                        <div>
                            <div>Postsecondary certificate or diploma</div>
                            <div>6.5% unemployment rate</div>
                        </div>
                        <div>
                            <div>Total, all education levels</div>
                            <div>7.7% unemployment rate</div>
                        </div>
                        <div>
                            <div>High school graduate</div>
                            <div>8.4% unemployment rate</div>
                        </div>
                        <div>
                            <div>Some postsecondary</div>
                            <div>9.0% unemployment rate</div>
                        </div>
                        <div>
                            <div>Some high school</div>
                            <div>14.2% unemployment rate</div>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-medium">Geographic Considerations</h3>
                    <p className="text-sm text-gray-600 mt-2">
                        Regional job markets vary significantly. Consider the following when planning your career:
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>British Columbia and Ontario offer diverse opportunities in technology and services</span>
                        </li>
                        <li className="flex">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Alberta has high wages but more volatility in resource-dependent sectors</span>
                        </li>
                        <li className="flex">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Atlantic provinces offer growing opportunities in tourism and ocean technology</span>
                        </li>
                        <li className="flex">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Remote work options have expanded, offering flexibility in location</span>
                        </li>
                    </ul>
                </div>
            </Card>
        </div>
    </div>
);

export default Dashboard;