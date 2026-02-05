	1. Dubble booking 
		- When two customers select a time slot at the same time and continue to booking the time will still be available util the customer has booked the time. 
		- This can cause two customers to choose the same time and then have to start over because someone else booked the time first.
		- It could become visible with just two users but will probably occur more often as the customer base grows 
	2. Solution 
		- We need to make sure the booking slot is locked as soon as the customer presses it and have it locked for 5-10 min
	  - If the customer books the slot within the 5-10 min the slot becomes permanently unavailable 
		- If the customer does not book within the 5-10 min it will unlock automatically and become available again
		- We can use WebSocket to show real time availability and update availability across all connected clients instantly 
		- We can also add logging to make sure the user know the time becomes available if failed to book within 5-10 minutes 
		- This improves scalability and fault tolerance if multiple users want to book at the same time and prevents double bookings and having to start over
  3. Plan the required to implement the selected solution
    - We will change the backend part of the code to make sure double booking will not happen
    - We will not change the fontend or anything else other then the backend part
    - The first step will be that the time slot will be reserved until either the customer books the time or the time runs out and it becomes available again
	
    
