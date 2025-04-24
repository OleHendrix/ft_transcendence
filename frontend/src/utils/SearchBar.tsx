interface SearchBarProps
{
	setSearchInput: React.Dispatch<React.SetStateAction<string>>,
	backGroundColor?: string
}

function SearchBar({setSearchInput, backGroundColor} : SearchBarProps)
{
	return (
		<label className={`flex items-center gap-2 ${backGroundColor ?? 'bg-[#1b1b1b]'} text-white px-4 py-2 rounded-2xl w-full md:max-w-[200px] border border-[#323232] focus-within:border-[#ff914d] transition`}>
			<svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="11" cy="11" r="8" /> <line x1="21" y1="21" x2="16.65" y2="16.65" /> </svg>
			<input className="bg-transparent outline-none w-full text-sm placeholder-gray-400" type="search" placeholder="Search..." onChange={(e) => setSearchInput(e.target.value)}/>
		</label>
	)
}

export default SearchBar