import { useState, useEffect, useRef } from 'react'
import './ChapterSearch.css'

function ChapterSearch({ selectedChapters, onChapterChange, chapters }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredChapters, setFilteredChapters] = useState([])
  const dropdownRef = useRef(null)

  // Filter chapters based on search term (but don't sort by selection anymore)
  useEffect(() => {
    if (!chapters) return
    
    const filtered = chapters.filter(chapter => 
      chapter.chapter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chapter.country && chapter.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chapter.university && chapter.university.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    // Sort alphabetically only
    filtered.sort((a, b) => a.chapter.localeCompare(b.chapter))
    
    setFilteredChapters(filtered)
  }, [searchTerm, chapters])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChapterToggle = (chapterId) => {
    // Handle both string and number IDs for comparison
    const isCurrentlySelected = selectedChapters.some(id => 
      id == chapterId // Use loose equality to handle string/number conversion
    )
    
    const newSelected = isCurrentlySelected
      ? selectedChapters.filter(id => id != chapterId) // Use loose equality
      : [...selectedChapters, chapterId]
    
    onChapterChange(newSelected)
  }

  const clearAll = () => {
    onChapterChange([])
  }

  const selectAll = () => {
    onChapterChange(filteredChapters.map(c => c.chapter_id))
  }

  // Get selected chapter objects for display
  const getSelectedChapterObjects = () => {
    return selectedChapters.map(id => 
      chapters.find(chapter => chapter.chapter_id == id) // Use loose equality
    ).filter(Boolean)
  }

  return (
    <div className="chapter-search" ref={dropdownRef}>
      <div 
        className="search-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        title="Filter by chapters"
      >
        <span className="search-icon">🔍</span>
        <span className="search-text">
          {selectedChapters.length === 0 
            ? 'All Chapters' 
            : `${selectedChapters.length} Chapter${selectedChapters.length === 1 ? '' : 's'}`
          }
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="search-dropdown">
          <div className="search-controls">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search chapters, countries, universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Selected chapters display */}
            {selectedChapters.length > 0 && (
              <div className="selected-chapters-container">
                <div className="selected-chapters-header">
                  <span>Selected Chapters ({selectedChapters.length})</span>
                  <button onClick={clearAll} className="clear-all-btn">
                    Clear All
                  </button>
                </div>
                <div className="selected-chapters-list">
                  {getSelectedChapterObjects().map(chapter => (
                    <div key={chapter.chapter_id} className="selected-chapter-tag">
                      <span className="selected-chapter-name">{chapter.chapter}</span>
                      <button 
                        className="remove-chapter-btn"
                        onClick={() => handleChapterToggle(chapter.chapter_id)}
                        title="Remove chapter"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="control-buttons">
              {searchTerm && (
                <button onClick={selectAll} className="control-btn select">
                  Select All
                </button>
              )}
            </div>
          </div>

          <div className="chapter-list">
            {filteredChapters.length === 0 ? (
              <div className="no-results">No chapters found</div>
            ) : (
              filteredChapters.map(chapter => {
                // Use loose equality to handle string/number comparison
                const isSelected = selectedChapters.some(id => id == chapter.chapter_id)
                return (
                  <div
                    key={chapter.chapter_id}
                    className={`chapter-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleChapterToggle(chapter.chapter_id)}
                  >
                    <div className="chapter-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent onClick
                      />
                    </div>
                    <div className="chapter-info">
                      <div className="chapter-name">{chapter.chapter}</div>
                      <div className="chapter-details">
                        {chapter.country && (
                          <span className="country">{chapter.country}</span>
                        )}
                        {chapter.city && chapter.country && ' • '}
                        {chapter.city && (
                          <span className="city">{chapter.city}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ChapterSearch
