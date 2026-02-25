Task 2 

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
    - The first step is to prepare the system to temporarily reserve a time slot until the booking is confirmed or the reservation expires.
	
4.  Begin refactoring 
- The first step in the refactoring plan is to  extend the existing booking model by introducing an expiresAt field which  uses a Date type to support time-based reservation logic. This field is initially set to      null to represent a confirmed booking . When a user selects a time slot, the field is assigned a future timestamp, indicating temporary reservation. The reservation remains valid until the expiration time is       reached, after which the time slot becomes available again if the booking has not been confirmed and the expireAt is set to null again.

5. Basic logging
   - Logger has been implemented in the system.



