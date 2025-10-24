import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
              ✨ Automated Internal Mark Statement Generator
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                AutoMetric
              </span>
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-cyan-100 font-semibold">
              Mark Statement Generator
            </p>
            <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Automatically compute and display students' internal marks based on syllabus-defined assessment components. 
              Apply prescribed internal mark split-ups with weighted evaluations ensuring fairness and consistency. 
              Generate comprehensive subject-wise mark statements with overall result analysis and distribution patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-indigo-700 px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                🚀 Get Started Free
              </Link>
              <Link
                href="#features"
                className="border-2 border-white text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-indigo-700 transition-all backdrop-blur-sm"
              >
                📊 Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full text-sm font-semibold text-indigo-700">
              🎯 Complete Mark Management Solution
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Automated Mark Statement Generation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Intelligent system that applies syllabus-prescribed internal mark split-ups, computes weighted assessments, 
              and generates comprehensive subject-wise statements with distribution analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-indigo-600 hover:-translate-y-1">
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Automated Computation
              </h3>
              <p className="text-gray-600">
                Automatically compute internal marks based on syllabus-defined assessment components with prescribed split-up formulas
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-cyan-600 hover:-translate-y-1">
              <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Weighted Assessment
              </h3>
              <p className="text-gray-600">
                Apply component-wise weightage according to syllabus guidelines ensuring fairness and consistency in evaluation
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-purple-600 hover:-translate-y-1">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Subject-wise Statements
              </h3>
              <p className="text-gray-600">
                Generate comprehensive mark statements for each subject with overall result analysis and performance metrics
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-orange-600 hover:-translate-y-1">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Distribution Analysis
              </h3>
              <p className="text-gray-600">
                Visualize mark distribution across ranges with comprehensive analytics showing performance patterns and trends
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-green-600 hover:-translate-y-1">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                Result Analysis
              </h3>
              <p className="text-gray-600">
                Generate overall result analysis with pass/fail statistics, class averages, and performance benchmarks
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-blue-600 hover:-translate-y-1">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">
                PDF Generation
              </h3>
              <p className="text-gray-600">
                Export professional mark statements with charts, signatures, and institutional branding in PDF format
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Automate Your Mark Statements?
          </h2>
          <p className="text-xl mb-8 text-cyan-100 max-w-2xl mx-auto">
            Join educators using AutoMetric to automatically generate accurate, syllabus-compliant internal mark statements
          </p>
          <Link
            href="/register"
            className="bg-white text-indigo-700 px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl inline-block transform hover:-translate-y-1"
          >
            🚀 Start Generating Statements Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
