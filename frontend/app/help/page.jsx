import { FiUser } from "react-icons/fi";
export default function Home() {
    return (
        <>
            <div className="px-24">
                <div className="my-8 text-center">
                    <h1 className="text-3xl font-bold my-4">Welcome to <span className="text-primary-700">Peer Talks</span> Help Center</h1>
                </div>
                <section className="text-justify leading-7">

                    Welcome to Peer Talks Help Center
                    Greetings! 🚀 At Peer Talks, we're committed to ensuring you have the best experience possible. Whether you're new to the platform or seeking assistance on specific features, our Help Center is here to guide you every step of the way.
                    Navigate seamlessly, find answers effortlessly, and explore the full potential of Peer Talks. From frequently asked questions to step-by-step guides and troubleshooting tips, this hub is designed to empower you with the knowledge you need.
                </section>
                <div className="my-8">
                    <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2">Q: How can I log out of my Peer Talks account?</h3>
                        <p className="text-gray-600">
                            A: Ready to take a break? Follow these steps:
                            <br />
                            1. Click on the logout
                            <span className="inline-block">
                                <span className="sr-only">logout</span>
                                <svg className="w-3 h-6 mx-1 mb-1 py-1 inline-block" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" stroke="currentColor" fill="primary-300" version="1.1" id="Capa_1" viewBox="0 0 384.971 384.971" space="preserve">
                                    <g>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={30} d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03    C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03    C192.485,366.299,187.095,360.91,180.455,360.91z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={20} d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279    c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179    c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z" />
                                    </g>
                                </svg>
                            </span>
                            icon in the bottom navigation bar to log out.
                            <br />
                            Remember to keep your login credentials secure. You can log back in anytime to resume your Peer Talks experience.
                        </p>
                    </div>
                    <FAQ question="How can I search for a friend on Peer Talks?">
                        <span>Click on the search icon<span className="inline-block align-middle"><svg className="w-6 h-5 mb-1 mx-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>in the navigation bar.</span>
                        <span>Enter your friend's username in the search bar.</span>
                        <span>Select your friend from the search results and start a chat.</span>
                    </FAQ>
                    <FAQ question="Can I edit my profile information on Peer Talks?">
                        <span>Select Profile icon <span className="inline-block mx-auto"><FiUser className="w-5 h-6 " /></span> from the navigation bar.</span>
                        <span>Make the desired changes to your profile picture, bio, or other details.</span>
                        <span>Click "Update" to update your profile.</span>
                    </FAQ>
                </div>
            </div>
        </>
    );
}

function FAQ({ children, question }) {
    return <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Q. {question}</h3>

        <ol className="text-gray-600 flex flex-col gap-y-2 list-decimal">
            {children.map((elem, idx) => {
                return <li key={idx} className="relative ml-3">
                    {elem}
                </li>
            })}
        </ol>
    </div>
}